# Color Palette Contrast Tester

<p>The <a href = "http://daniel-soltis.com/contrast/">Color Palette Contrast Tool</a> evaluates the contrast between colors in a palette, to make it easier to create UI that meets 
<a href = https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html> 
Web Content Accessibility Guidelines</a>. 
Unlike most other available tools, it evaluates a full palette rather than a single pair of colors, 
and it loads and saves files used with common design programs.</p>

<h2>Loading and saving palettes</h2>
<p>Use the top menu buttons to load and save color palettes. Colors are limited to solid colors; no transparency, pattern fills or gradients. Supported formats include:

- Adobe Swatch Exchange (.ase). Right now, the tool will read grouped colors but won't preserve the groupings when you save. It's on the to-do list.</li>
- Sketch palette (.sketchpalette), for use with the <a href = https://github.com/andrewfiorillo/sketch-palettes>Sketch palettes plugin</a></li>
- Comma-separated values (.csv) in a custom format. This lets you save and view palettes without any design software.</li>
</p>

<h2>Adding an individual color</h2>
<p>To add an individual color, click on the ‘add color’ button at the top left of the main content area. 
You can enter RGB or hex values.
</p>

<h2>Changing a color</h2>
<p>To change a color, click on the label at the left or top of the main content area. 
You can make the color darker or lighter, or directly change its value.</p>

<h2>Copyright and credits</h2>
<p>Copyright under <a href = https://opensource.org/licenses/MIT>MIT License</a> by Daniel Soltis 2019.</p>

<p>ASE file reading uses code from Ger Hobbelt, which I can't seem to find online anymore...</p>
<p>Sketchpalette encoding uses code derived from the source code for Andrew Fiorillo's Sketch palettes plugin.</p>
