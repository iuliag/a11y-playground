import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="cards">
      <!-- Missing required ARIA attributes for listbox -->
      <div role="listbox">
        <div role="option">Option 1</div>
        <div role="option">Option 2</div>
      </div>
      
      <!-- Invalid ARIA attribute -->
      <button aria-required="invalid">Submit</button>
      
      <!-- Missing ARIA label for form control -->
      <input type="text">
      
      <!-- Incorrect ARIA role for element -->
      <a href="#" role="button">Link as button</a>
      
      <!-- ARIA label not matching visible text -->
      <button aria-label="Submit form">Click here to proceed</button>
      
      <!-- Missing ARIA live region attributes -->
      <div role="alert">Important message</div>
      
      <!-- Invalid ARIA state -->
      <div role="checkbox" aria-checked="maybe">Check me</div>
    </div>
  `;
  block.append(content);
}
