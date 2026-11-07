import requests

with open('backend/data/test_images/f11.jpeg', 'rb') as f:
    r = requests.post(
        'http://127.0.0.1:8000/api/donations/analyze',
        files={'image': f},
        data={'category': 'Food', 'title': 'Test f11', 'storage_condition': 'sealed', 'hours_since_cooked': '2'}
    )
    print('Status:', r.status_code)
    data = r.json()
    print('is_edible:', data['analysis']['is_edible'])
    print('edibility_score:', data['analysis']['edibility_score'])
    print('detected_food_type:', data['analysis']['detected_food_type'])
    print('safety_status:', data['analysis']['safety_status'])
    print('safety_explanation:', data['analysis']['safety_explanation'])
    print('stream_type:', data['analysis']['stream_type'])
    print('top_partner:', data['recommended_partners'][0]['name'], f"({data['recommended_partners'][0]['organization_type']})")
