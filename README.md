# Travel advice - The Netherlands foreign affairs

This repo provides a grunt script to scrape travel advice from the website of the Dutch ministry of foreign affairs.

## creating the world topojson

Extra target for the `world-atlas` Makefile.
```
world-50m-topo.json: shp/ne_50m_admin_0_countries.shp
	$(TOPOJSON) -q 1e5 -s 1e-5 --id-property=iso_a3 -- countries=shp/ne_50m_admin_0_countries.shp > ../../data/$@
```

Note that grunt-tasks do not work yet.

## Ideas

- Collapse island groups to simpler geometeries (bounding box), saves lots of data for Greenland and allows more detail elsewhere.


## Missing/disputed regions
 - NL is missing: no travel advice for own country.
 - Somaliland region
 - Western Sahara region
