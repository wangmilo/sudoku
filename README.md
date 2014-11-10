# Sudoku

## Overview
This game includes a solver and a board generator with 3 difficulty levels.

It works on desktop and on mobile devices. The default mobile keyboard has been disabled and replaced with a customized number keypad to preserve screen space.

It has been tested on iPhone 5S, iPad, Nexus 4, Macbook and PC with Chrome, Firefox, Safari and IE9/10.

## Code Architecture
The Sudoku game was written using vanilla HTML, CSS and JavaScript, without external libraries for lightweightness.

Sudoku.js uses singleton pattern for modularity and to create a namespace for avoiding variable name collisions. 

Functions closely related to the Sudoku class has been grouped into the prototype of the class, to increase readability, maintainability and modularity. It could also be extended to support multiple boards simulataneously.

The UI tasks were delegated to CSS classes (through JavaScript event listeners) to separate the view from the logic as much as possible.

## Creator
** Milo Wang **