export default function decorate(block) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="hero">
      <!-- Missing role on interactive element -->
      <div class="hero-button" tabindex="0">Click me</div>
      
      <!-- Invalid ARIA attribute value -->
      <button aria-expanded="maybe">Toggle</button>
      
      <!-- Missing required ARIA attributes -->
      <div role="tablist">
        <div role="tab">Tab 1</div>
        <div role="tab">Tab 2</div>
      </div>
      
      <!-- Duplicate ARIA IDs -->
      <div id="content1" aria-labelledby="content1 content1">Content</div>
      
      <!-- Invalid ARIA role -->
      <div role="invalid-role">Invalid role</div>
      
      <!-- Missing accessible name -->
      <img src="image.jpg" alt="">
      
      <!-- ARIA hidden with focusable content -->
      <div aria-hidden="true">
        <button>Hidden but focusable</button>
      </div>
    </div>
  `;
  block.append(content);
}
