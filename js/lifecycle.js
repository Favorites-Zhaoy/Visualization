const disposers = new Set();
export function cleanupWith(dispose) {
  disposers.add(dispose);
  return () => { disposers.delete(dispose); dispose(); };
}
window.addEventListener('pagehide',event=>{
  if(event.persisted)return;
  for(const dispose of disposers)dispose();
  disposers.clear();
});
