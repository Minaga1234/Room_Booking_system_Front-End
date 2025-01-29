document.addEventListener("DOMContentLoaded", () => {
  const floorMap = document.getElementById("floor-map");
  const roomInfo = document.getElementById("room-info");

  const rooms = [
      { id: 1, name: "Conference Room A", capacity: 20, bookings: 15 },
      { id: 2, name: "Meeting Room B", capacity: 8, bookings: 3 },
      { id: 3, name: "Boardroom", capacity: 12, bookings: 10 },
      { id: 4, name: "Huddle Space", capacity: 4, bookings: 2 },
      { id: 5, name: "Training Room", capacity: 30, bookings: 25 },
      { id: 6, name: "Quiet Zone", capacity: 6, bookings: 1 },
  ];

  function createRoom(room) {
      const roomElement = document.createElement("div");
      roomElement.className = "room";
      roomElement.style.backgroundColor = getOccupancyColor(room.bookings, room.capacity);

      const nameElement = document.createElement("div");
      nameElement.className = "room-name";
      nameElement.textContent = room.name;

      const occupancyElement = document.createElement("div");
      occupancyElement.className = "occupancy";

      for (let i = 0; i < room.bookings; i++) {
          const person = document.createElement("div");
          person.className = "person";
          person.style.animationDelay = `${i * 0.1}s`;
          occupancyElement.appendChild(person);
      }

      roomElement.appendChild(nameElement);
      roomElement.appendChild(occupancyElement);

      roomElement.addEventListener("click", () => showRoomDetails(room));

      return roomElement;
  }

  function getOccupancyColor(bookings, capacity) {
      const occupancyRate = bookings / capacity;
      const hue = (1 - occupancyRate) * 120; // 120 is green, 0 is red
      return `hsl(${hue}, 70%, 70%)`;
  }

  function showRoomDetails(room) {
      roomInfo.innerHTML = `
          <h3>${room.name}</h3>
          <p>Capacity: ${room.capacity}</p>
          <p>Current Bookings: ${room.bookings}</p>
          <p>Occupancy Rate: ${Math.round((room.bookings / room.capacity) * 100)}%</p>
      `;
  }

  rooms.forEach((room) => {
      floorMap.appendChild(createRoom(room));
  });
});
