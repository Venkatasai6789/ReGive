import os
import json

with open('backend/data/test_drive_images_results.json') as f:
    results = json.load(f)

print(f"Total images evaluated: {len(results)}\n")
for r in results:
    status_str = "EDIBLE (HUMAN)" if r['is_edible'] else "INEDIBLE (WASTE/RECOVERY)"
    print(f"[{r['image']}] -> {status_str} (Score: {r['edibility_score']*100:.1f}%)")
    print(f"   Detected Type: {r['detected_food_type']}")
    print(f"   BLIP Caption : {r['blip_caption']}")
    print(f"   Safety Status: {r['safety_status']}")
    print(f"   Stream       : {r['stream_type']}")
    print(f"   Top Partner  : {r['top_partner']} ({r['match_score']}%)\n")
