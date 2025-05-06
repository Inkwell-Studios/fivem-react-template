// Simplest possible implementation - no dependencies, just direct DOM manipulation
export function makeElementDraggable(
  element: HTMLElement | null,
  dragHandle?: string
): (() => void) | undefined {
  // Basic safety check
  if (!element) return;

  // Set initial styles
  element.style.position = 'absolute';
  element.style.zIndex = '1000';
  
  // Initial position
  if (!element.style.top) element.style.top = '100px';
  if (!element.style.left) element.style.left = '100px';

  // Variables to track position
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  // Get the handle element or use the element itself
  const handle = dragHandle ? (element.querySelector(dragHandle) as HTMLElement | null) : element;
  
  if (!handle) return;
  
  // Add mousedown event
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e: MouseEvent) {
    e = e || (window.event as MouseEvent);
    e.preventDefault();
    
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
    document.onmouseup = closeDragElement;
  }

  function elementDrag(e: MouseEvent) {
    e = e || (window.event as MouseEvent);
    e.preventDefault();
    if (!element) return;
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // Return a cleanup function
  return function cleanup() {
    handle.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
  };
} 