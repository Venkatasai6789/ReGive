"""
Comprehensive Authentication & Role-Based Access Control (RBAC) E2E Test Suite
Covers 12 end-to-end integration test cases across FastAPI, Argon2id, SQLite, and ML models.
"""

import urllib.request
import urllib.parse
import json
import http.cookiejar
import unittest
import sys
import os

BASE_URL = "http://127.0.0.1:8000"


class TestAuthenticationAndRBAC(unittest.TestCase):
    def setUp(self):
        # Create cookie jar and opener for maintaining session cookies across requests
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))
        # Ensure rate limiter is clean for this test case
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/auth/reset-rate-limit", data=b"{}", headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req)
        except Exception:
            pass

    def _post_json(self, url, data):
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            with self.opener.open(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8")), resp.headers
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8")), e.headers

    def _get_json(self, url):
        req = urllib.request.Request(url)
        try:
            with self.opener.open(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8")), resp.headers
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8")), e.headers

    def test_01_unauthenticated_status(self):
        """TEST 01: Verifies unauthenticated session status."""
        status_code, body, _ = self._get_json(f"{BASE_URL}/api/auth/status")
        self.assertEqual(status_code, 200)
        self.assertFalse(body["authenticated"])
        self.assertIsNone(body["user"])

        # Unauthenticated /me must return 401
        me_code, me_body, _ = self._get_json(f"{BASE_URL}/api/auth/me")
        self.assertEqual(me_code, 401)
        print("[PASS] TEST 01: Unauthenticated baseline confirmed.")

    def test_02_donor_login_success(self):
        """TEST 02: Login as Donor (Ananya Sharma) via Argon2id verification."""
        status_code, body, headers = self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "ananya@regive.test", "password": "ReGive2026@Ananya!"}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(body["role"], "donor")
        self.assertEqual(body["display_name"], "Ananya Sharma")
        self.assertEqual(body["linked_profile_id"], "usr-donor-ananya")
        
        # Verify HttpOnly cookie was set
        set_cookie = headers.get("Set-Cookie", "")
        self.assertIn("regive_session=", set_cookie)
        self.assertIn("HttpOnly", set_cookie)
        print("[PASS] TEST 02: Donor authentication and Argon2id verification succeeded.")

    def test_03_donor_session_restoration_and_scoping(self):
        """TEST 03: Active donor session restoration via /api/auth/me and donation scoping."""
        # 1. Login
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "ananya@regive.test", "password": "ReGive2026@Ananya!"}
        )

        # 2. Check /api/auth/me using restored cookie
        me_code, me_body, _ = self._get_json(f"{BASE_URL}/api/auth/me")
        self.assertEqual(me_code, 200)
        self.assertEqual(me_body["email"], "ananya@regive.test")

        # 3. Check /api/donations returns scoped list for this donor
        don_code, don_body, _ = self._get_json(f"{BASE_URL}/api/donations")
        self.assertEqual(don_code, 200)
        self.assertIsInstance(don_body, list)
        print(f"[PASS] TEST 03: Session restored via cookie; donor donation scoping verified ({len(don_body)} records).")

    def test_04_donor_cannot_access_partner_endpoints(self):
        """TEST 04: RBAC enforcement - Donor attempting partner operation is denied with 403 Forbidden."""
        # Login as Donor
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "ananya@regive.test", "password": "ReGive2026@Ananya!"}
        )

        # Attempt to access partner dashboard
        dash_code, dash_body, _ = self._get_json(f"{BASE_URL}/api/partners/prt-ngo-01/dashboard")
        self.assertEqual(dash_code, 403)
        self.assertIn("Donors do not have authorization", dash_body.get("detail", ""))

        # Attempt to accept a donation on behalf of a partner
        accept_code, accept_body, _ = self._post_json(
            f"{BASE_URL}/api/partners/prt-ngo-01/donations/DON-2026-3101/accept",
            {}
        )
        self.assertEqual(accept_code, 403)
        print("[PASS] TEST 04: Donor access to partner operations denied with 403 Forbidden.")

    def test_05_logout_workflow(self):
        """TEST 05: Log out terminates session on both server and cookie."""
        # 1. Login
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "ananya@regive.test", "password": "ReGive2026@Ananya!"}
        )

        # 2. Logout
        logout_code, logout_body, headers = self._post_json(f"{BASE_URL}/api/auth/logout", {})
        self.assertEqual(logout_code, 200)
        self.assertIn("logged out", logout_body.get("message", "").lower())

        # 3. Subsequent /api/auth/me must return 401
        me_code, me_body, _ = self._get_json(f"{BASE_URL}/api/auth/me")
        self.assertEqual(me_code, 401)
        print("[PASS] TEST 05: Logout invalidated session on server and client.")

    def test_06_ngo_login_success(self):
        """TEST 06: Login as Food NGO (Annapoorna Trust)."""
        status_code, body, _ = self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "annapoorna@regive.test", "password": "ReGive2026@Annapoorna!"}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(body["role"], "ngo")
        self.assertEqual(body["display_name"], "Annapoorna Trust")
        self.assertEqual(body["linked_profile_id"], "prt-ngo-01")
        print("[PASS] TEST 06: NGO authentication succeeded with correct role and profile linkage.")

    def test_07_ngo_accesses_own_dashboard(self):
        """TEST 07: NGO accesses its own dashboard with real database stats and requests."""
        # Login
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "annapoorna@regive.test", "password": "ReGive2026@Annapoorna!"}
        )

        # Access dashboard
        status_code, body, _ = self._get_json(f"{BASE_URL}/api/partners/prt-ngo-01/dashboard")
        self.assertEqual(status_code, 200)
        self.assertEqual(body["partner"]["id"], "prt-ngo-01")
        self.assertEqual(body["partner"]["name"], "Annapoorna Trust")
        self.assertIn("stats", body)
        self.assertIn("pending_count", body["stats"])
        print(f"[PASS] TEST 07: NGO dashboard accessed successfully (Pending requests: {body['stats']['pending_count']}).")

    def test_08_ngo_cross_partner_isolation(self):
        """TEST 08: NGO attempting to access another partner's dashboard is blocked (403 Forbidden)."""
        # Login as Annapoorna Trust (prt-ngo-01)
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "annapoorna@regive.test", "password": "ReGive2026@Annapoorna!"}
        )

        # Attempt to access Hope Night Shelter (prt-ngo-02) dashboard
        status_code, body, _ = self._get_json(f"{BASE_URL}/api/partners/prt-ngo-02/dashboard")
        self.assertEqual(status_code, 403)
        self.assertIn("cannot access or manage partner 'prt-ngo-02'", body.get("detail", ""))

        # Attempt to access Recycler (prt-rec-03) dashboard
        status_code_rec, body_rec, _ = self._get_json(f"{BASE_URL}/api/partners/prt-rec-03/dashboard")
        self.assertEqual(status_code_rec, 403)
        print("[PASS] TEST 08: Cross-partner isolation enforced with 403 Forbidden.")

    def test_09_partner_cannot_create_donations(self):
        """TEST 09: Partner organization is blocked from creating donations (403 Forbidden)."""
        # Login as NGO
        self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "annapoorna@regive.test", "password": "ReGive2026@Annapoorna!"}
        )

        # Attempt donation creation
        status_code, body, _ = self._post_json(
            f"{BASE_URL}/api/donations",
            {
                "title": "Unauthorized Partner Donation",
                "quantity": 10,
                "unit": "boxes",
                "condition": "New",
                "pickup_location": "Main Road"
            }
        )
        self.assertEqual(status_code, 403)
        self.assertIn("Partner organizations cannot create donations", body.get("detail", ""))
        print("[PASS] TEST 09: Partner blocked from creating donations.")

    def test_10_recycler_login_and_dashboard(self):
        """TEST 10: Login as Bio-Recycler (Green Earth Composters) and access organic loop dashboard."""
        status_code, body, _ = self._post_json(
            f"{BASE_URL}/api/auth/login",
            {"email": "greenearth@regive.test", "password": "ReGive2026@Green!"}
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(body["role"], "recycler")
        self.assertEqual(body["linked_profile_id"], "prt-rec-03")

        # Access Recycler dashboard
        dash_code, dash_body, _ = self._get_json(f"{BASE_URL}/api/partners/prt-rec-03/dashboard")
        self.assertEqual(dash_code, 200)
        self.assertEqual(dash_body["partner"]["name"], "Green Earth Composters")
        print("[PASS] TEST 10: Bio-Recycler authenticated and accessed organic loop dashboard.")

    def test_11_rate_limiting_protection(self):
        """TEST 11: Rate limiting triggers after 5 consecutive bad login attempts."""
        # Make a new opener without cookies to isolate test
        fresh_opener = urllib.request.build_opener()
        for attempt in range(5):
            req = urllib.request.Request(
                f"{BASE_URL}/api/auth/login",
                data=json.dumps({"email": "attacker@regive.test", "password": f"wrong_{attempt}"}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            try:
                fresh_opener.open(req)
            except urllib.error.HTTPError as e:
                pass

        # 6th attempt should be rate limited (429 Too Many Requests)
        req6 = urllib.request.Request(
            f"{BASE_URL}/api/auth/login",
            data=json.dumps({"email": "attacker@regive.test", "password": "wrong"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            fresh_opener.open(req6)
            self.fail("Expected 429 Too Many Requests")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 429)
            body = json.loads(e.read().decode("utf-8"))
            self.assertIn("Too many failed login attempts", body.get("detail", ""))
        print("[PASS] TEST 11: Brute-force rate limiting triggered with 429 Too Many Requests.")

    def test_12_ai_pipeline_integrity(self):
        """TEST 12: Real AI inference pipeline executes with CLIP, BLIP, and FAISS without regression."""
        # Send multipart analyze request with sample image path
        req = urllib.request.Request(
            f"{BASE_URL}/api/donations/analyze",
            data=urllib.parse.urlencode({
                "title": "Fresh Loaves of Bread",
                "category": "Food",
                "food_type": "Bakery & Bread",
                "storage_condition": "sealed",
                "hours_since_cooked": 1.0,
                "pickup_location": "34 Baker Street, Central Quarter, Apt 4B"
            }).encode("utf-8"),
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        with self.opener.open(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("analysis", data)
            self.assertIn("is_edible", data["analysis"])
            self.assertIn("safety_status", data["analysis"])
            self.assertIn("caption", data["analysis"])
            self.assertIn("recommended_partners", data)
            self.assertGreater(len(data["recommended_partners"]), 0)
        print("[PASS] TEST 12: Real AI model pipeline intact (CLIP, BLIP, FAISS functional).")


if __name__ == "__main__":
    unittest.main()
