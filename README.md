# Family Tree

Minimal open source genealogy management &mdash; trace lineages in your family history or visualize your family tree or whole family network.

## Current features

### Data storage
- Persons
    - First, middle, last, birth name(s)
    - Birth, death dates
    - Additional notes
- Relations
    - Children (biologicatl, adopted)
    - Civil partnership (married, divorced, widowed)
    - Additional notes
- Sources
    - Upload scanned documents (image files)
    - Annotate sources
    - Link sources to related persons

### Doppelgangers
- (Linked) duplicates of person nodes to "unravel" the network

### User roles
- Admin (Normal + can manage users)
- Normal (Viewer + can edit)
- Viewer (can view)
- Guest (can view limited information)

Infinite edit history
- Review changes
- Preview and restore previous states

### Visualizations
- Network (default)
    - The full family with all relations in one large network
    - Manual layout
- Tree view
    - Ancestors and descendants of a selected person
    - Auto-generated layout

### More
- Simple person search
- Help texts for most features
- Introduction tutorial (on first login)

## Server requirements
- PHP >= 7.4
  (Extensions: gd, Imagick, openssl)
- Git

## Screenshots
![Screenshots](../docs/screenshot.jpg)
