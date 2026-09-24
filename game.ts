type Direction = 'north' | 'east' | 'south' | 'west';
interface Room { name: string; image: string; theme: string; mood: string; alt: string; description: string; blocked: Partial<Record<Direction, string>>; }
const rooms: Room[][] = [
  [
    { name: 'Spiral Stair', image: 'images/spiral-stair.png', theme: 'spiral-stair', mood: 'Hushed, shadowy and mysterious', alt: 'Iron spiral stairs winding around a weathered stone pillar.', description: 'An iron staircase coils around a salt-stained stone pillar. To the east, lamplight spills through an open arch, while steps to the south descend into the kitchen.', blocked: { north: 'The stone tower wall blocks the way north.', west: 'A solid stone wall blocks the way west.' } },
    { name: 'Lamp Room', image: 'images/lamp-room.png', theme: 'lamp-room', mood: 'Golden, bright and watchful', alt: 'A glowing golden lighthouse lens overlooking the stormy sea.', description: 'A great glass lens throws a golden beam across the dark water. An arch to the west leads to the spiral stair, and an iron ladder to the south descends to the rocks.', blocked: { north: 'The curved glass enclosure blocks the way north.', east: 'Beyond the eastern glass is a sheer drop to the sea.' } }
  ],
  [
    { name: "Keeper's Kitchen", image: 'images/keepers-kitchen.png', theme: 'keepers-kitchen', mood: 'Warm, sheltered and homely', alt: 'A copper kettle, bread and stone stairs in the keeper’s kitchen.', description: 'A copper kettle rests on a cold stove beside a loaf of bread. Stairs rise to the north, and an eastern door stands open to the wet rocks.', blocked: { south: 'The kitchen wall blocks the way south.', west: 'A heavy stove and stone wall block the way west.' } },
    { name: 'Rocks', image: 'images/rocks.png', theme: 'rocks', mood: 'Cold, wild and exposed', alt: 'Wet black rocks below a lighthouse with a glowing lamp and open kitchen door.', description: "Black rocks glisten beneath your feet as white surf breaks against the lighthouse. To the north, a narrow iron ladder reaches the lamp room, while a western door opens into the keeper's kitchen.", blocked: { south: 'Crashing waves make the southern rocks impassable.', east: 'The open sea blocks the way east.' } }
  ]
];
const offsets: Record<Direction, [number, number]> = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
const labels: Record<Direction, string> = { north: 'North ↑', east: 'East →', south: 'South ↓', west: 'West ←' };
const keys: Record<string, Direction> = { ArrowUp: 'north', ArrowRight: 'east', ArrowDown: 'south', ArrowLeft: 'west' };
let x = 1;
let y = 1;
const roomPanel = document.querySelector<HTMLElement>('section[aria-label="Current room"]')!;
const roomMood = document.getElementById('room-mood')!;
let roomFade: Animation | undefined;
const roomName = document.getElementById('room-name')!;
const roomImage = document.getElementById('room-image') as HTMLImageElement;
const description = document.getElementById('description')!;
const exits = document.getElementById('exits')!;
const message = document.getElementById('message')!;
function canMove(direction: Direction): boolean {
  const [dx, dy] = offsets[direction];
  return Boolean(rooms[y + dy]?.[x + dx]);
}
function render(): void {
  const room = rooms[y][x];
  document.body.dataset.roomTheme = room.theme;
  roomMood.textContent = room.mood;
  roomName.textContent = room.name;
  roomImage.src = room.image;
  roomImage.alt = room.alt;
  description.textContent = room.description;
  exits.textContent = 'You can go: ' + (Object.keys(offsets) as Direction[]).filter(canMove).map(direction => labels[direction]).join(' · ');
  document.querySelectorAll<HTMLElement>('[data-room]').forEach(cell => {
    const active = cell.dataset.room === `${x},${y}`;
    if (active) cell.setAttribute('aria-current', 'location');
    else cell.removeAttribute('aria-current');
    cell.querySelector('span')!.textContent = active ? 'You are here' : '';
  });
}
function move(direction: Direction): void {
  if (!canMove(direction)) {
    message.textContent = rooms[y][x].blocked[direction] ?? 'The way is blocked.';
    return;
  }
  const [dx, dy] = offsets[direction];
  x += dx;
  y += dy;
  message.textContent = '';
  render();
  roomFade?.cancel();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roomFade = roomPanel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
  }
}
document.addEventListener('keydown', event => {
  const direction = keys[event.key];
  if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  move(direction);
});
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
  button.addEventListener('click', () => move(button.dataset.direction as Direction));
});
render();

// Cache the four local scenes for smooth movement after the first visit.
rooms.forEach(row => row.forEach(room => { const image = new Image(); image.src = room.image; }));
