# Travel advice - The Netherlands foreign affairs

This repo provides a grunt script to scrape travel advice from the website of the Dutch ministry of foreign affairs.

## creating the world topojson

Extra target for the `world-atlas` Makefile.
```
world-50m-topo.json: shp/ne_50m_admin_0_countries.shp
	$(TOPOJSON) -q 1e5 -s 1e-6 --id-property=iso_a3 -- countries=shp/ne_50m_admin_0_countries.shp > $@
```

## Idea

- Collapse island groups to bounding box.


## Missing/disputed regions
 - Somaliland region
 - Western Sahara region
