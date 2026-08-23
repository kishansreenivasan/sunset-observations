# Sunset Observations

Final project site for an observational astronomy course. Six pencil sketches of the
setting sun made from one fixed site at 43.704534, -72.298737 between July 5 and
August 14, 2026, with the computed solar values for each date and a written reflection.

## Structure

```
index.html                 all page content
styles.css                 styling, including the day-to-night sky variables
main.js                    scroll-driven sky transition and reveal animations
assets/sketches/*.jpg      the six sketches, processed (see below)
netlify.toml               Netlify config, no build step
```

## Deploying

Static site, nothing to build.

1. Push this folder to a GitHub repo.
2. In Netlify: Add new site, Import an existing project, pick the repo.
3. Build command: leave empty. Publish directory: `.`
4. Deploy.

To preview locally: `python3 -m http.server` then open `http://localhost:8000`.

## The sky effect

The background moves from daylight to night as you scroll. The colour stops in
`main.js` are anchored to the observations: brightest at the July 5 sketch, when the
sun sat 7 degrees above the horizon; golden through late July; at the horizon by the
August 9 and 14 sketches, when computed altitude was roughly zero; night through the
data and reflection sections.

Sketch plates and figures keep a fixed light palette so pencil lines stay readable
against the darkening page. Users with `prefers-reduced-motion` get a static daylight
theme. Printing flattens everything to white.

## Data provenance

Recorded on site: date, time, location, and the drawing.

Computed, not measured: solar altitude, azimuth, sunset time, and day length, produced
with the [astral](https://pypi.org/project/astral/) Python library for the observation
coordinates in the America/New_York time zone, using each sketch's recorded clock time
as the input. This is stated in the data section and the footer of the page.

## Sketch processing

Photographs were rotated upright, perspective-corrected to the page edges, and tonally
normalized so all six read as the same paper and the same graphite. No sketch content
was altered.

## Before submitting

Fill in the bracketed placeholders in `index.html`: course number and name in the
header eyebrow, instructor name in the byline, and course and term in the footer.
