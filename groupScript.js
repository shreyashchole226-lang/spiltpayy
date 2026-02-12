// Improved group management script
// - Removes Firebase analytics
// - Uses async/await, better error handling, and DOM-safe rendering
// - Attach `createGroup` to `window` for backward compatibility

const API_URL = "http://127.0.0.1:5000";

async function createGroup() {
  const input = document.getElementById("groupName");
  if (!input) {
    console.error("createGroup: #groupName element not found");
    return;
  }

  const name = input.value.trim();
  if (!name) {
    alert("Enter group name");
    input.focus();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/create_group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = (data && data.message) || res.statusText || "Request failed";
      throw new Error(msg);
    }

    alert((data && data.message) || "Group created");
    input.value = "";
    await loadGroups();
  } catch (err) {
    console.error("createGroup error:", err);
    alert(err.message || "Unable to create group");
  }
}

async function loadGroups() {
  try {
    const res = await fetch(`${API_URL}/groups`);
    if (!res.ok) throw new Error(`Failed to load groups (${res.status})`);
    const data = await res.json();

    const container = document.getElementById("groupList");
    if (!container) {
      console.error("loadGroups: #groupList element not found");
      return;
    }

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      container.textContent = "No groups yet.";
      return;
    }

    const ul = document.createElement("ul");
    data.forEach(group => {
      const li = document.createElement("li");
      li.textContent = group.name || "(unnamed)";
      ul.appendChild(li);
    });

    container.appendChild(ul);
  } catch (err) {
    console.error("loadGroups error:", err);
    const container = document.getElementById("groupList");
    if (container) container.textContent = "Error loading groups";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("createGroupBtn");
  if (btn) btn.addEventListener("click", createGroup);
  window.createGroup = createGroup;
  loadGroups();
});

// Notes:
// - If you run the frontend from the filesystem (file://) you must host it
//   (e.g., `npx http-server .` or similar) so requests to `http://127.0.0.1:5000`
//   won't be blocked by browser security.
// - Ensure your backend allows CORS for the frontend origin.
