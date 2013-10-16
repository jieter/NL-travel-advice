# Travel advice - The Netherlands foreign affairs

This repo provides a grunt script to scrape travel advice from the website of the Dutch ministry of foreign affairs.

## creating the world topojson
Resulting in <3kB filesize, about the same as geojson with lower precision.
```
topojson -q 1e4 -s 1e-6 --id-property iso_a3 world_50m.geojson > world_50m.topojson
```

## Idea

- Collapse island groups to bounding box.


## Missing/disputed regions
 - Somaliland region
 - Western Sahara region

 - Zimbabwe
