let events = [];
let scene, camera, renderer, animationId;
let conflictingEvents = new Set();
let workingHours = { start: "09:00", end: "17:00" };

function setWorkingHours() {
    const workStart = document.getElementById("workStart").value;
    const workEnd = document.getElementById("workEnd").value;

    if (!workStart || !workEnd) {
        alert("Please fill both working hours fields");
        return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(workStart) || !timeRegex.test(workEnd)) {
        alert("Please use HH:MM format (e.g., 09:00)");
        return;
    }

    workingHours.start = workStart;
    workingHours.end = workEnd;

    document.getElementById("workingHoursDisplay").textContent =
        `Working Hours: ${workStart} - ${workEnd}`;

    // If events exist, re-schedule to check for new conflicts
    if (events.length > 0) {
        sendEvents();
    }
}

function addEvent() {
    const name = document.getElementById("name").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (!name || !start || !end) {
        alert("Please fill all fields");
        return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
        alert("Please use HH:MM format (e.g., 14:30)");
        return;
    }

    events.push({name, start, end});
    updateEventList();

    // Clear inputs
    document.getElementById("name").value = "";
    document.getElementById("start").value = "";
    document.getElementById("end").value = "";
}

function updateEventList(sortedEvents = null) {
    const list = document.getElementById("eventsList");
    list.innerHTML = "";

    const displayEvents = sortedEvents || events;

    displayEvents.forEach((e, i) => {
        const li = document.createElement("li");
        li.textContent = `${e.name}: ${e.start} - ${e.end}`;
        li.style.animation = `slideIn 0.3s ease ${i * 0.1}s both`;
        list.appendChild(li);
    });
}

// Convert time string "HH:MM" to minutes since midnight
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes back to "HH:MM" format
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Check if two time ranges overlap
function hasOverlap(start1, end1, start2, end2) {
    return !(end1 <= start2 || start1 >= end2);
}

// Detect conflicts between events (client-side)
function detectConflicts(events) {
    const conflicts = [];

    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            const event1 = events[i];
            const event2 = events[j];

            const start1 = timeToMinutes(event1.start);
            const end1 = timeToMinutes(event1.end);
            const start2 = timeToMinutes(event2.start);
            const end2 = timeToMinutes(event2.end);

            if (hasOverlap(start1, end1, start2, end2)) {
                // Suggest rescheduling the second event after the first
                const duration = end2 - start2;
                const suggestedStart = end1;
                const suggestedEnd = end1 + duration;

                conflicts.push({
                    event1: event1.name,
                    event2: event2.name,
                    suggestedStart: minutesToTime(suggestedStart),
                    suggestedEnd: minutesToTime(suggestedEnd)
                });
            }
        }
    }

    return conflicts;
}

// Detect events that fall during working hours (client-side)
function detectWorkingHourConflicts(events, workingHours) {
    const workingHourConflicts = [];

    const workStart = timeToMinutes(workingHours.start);
    const workEnd = timeToMinutes(workingHours.end);

    events.forEach(event => {
        const eventStart = timeToMinutes(event.start);
        const eventEnd = timeToMinutes(event.end);

        // Check if event overlaps with working hours
        if (hasOverlap(eventStart, eventEnd, workStart, workEnd)) {
            workingHourConflicts.push({
                eventName: event.name,
                eventStart: event.start,
                eventEnd: event.end,
                workStart: workingHours.start,
                workEnd: workingHours.end
            });
        }
    });

    return workingHourConflicts;
}

// Sort events by start time
function sortEventsByTime(events) {
    return [...events].sort((a, b) => {
        return timeToMinutes(a.start) - timeToMinutes(b.start);
    });
}

async function sendEvents() {
    if (events.length === 0) {
        alert("Please add some events first");
        return;
    }

    try {
        // Sort events by start time
        const sortedEvents = sortEventsByTime(events);

        // Detect conflicts client-side
        const conflicts = detectConflicts(sortedEvents);
        const workingHourConflicts = detectWorkingHourConflicts(sortedEvents, workingHours);

        // If backend is available, send data there (for your Java backend)
        try {
            const response = await fetch('http://localhost:8080/api/schedule', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(events)
            });

            if (response.ok) {
                const backendData = await response.json();
                // Use backend data if available, but add working hour conflicts
                displayConflicts(backendData.conflicts || conflicts, workingHourConflicts);
                updateEventList(backendData.sortedEvents || sortedEvents);
                visualizeSchedule(backendData.sortedEvents || sortedEvents, backendData.conflicts || conflicts, workingHourConflicts);
                return;
            }
        } catch (backendError) {
            // Backend not available, continue with client-side processing
            console.log("Backend not available, using client-side conflict detection");
        }

        // Use client-side conflict detection
        displayConflicts(conflicts, workingHourConflicts);
        updateEventList(sortedEvents);
        visualizeSchedule(sortedEvents, conflicts, workingHourConflicts);

    } catch (error) {
        console.error("Error scheduling events:", error);
    }
}

function displayConflicts(conflicts, workingHourConflicts) {
    const div = document.getElementById("conflicts");
    div.innerHTML = "";

    // Build set of conflicting event names
    conflictingEvents.clear();
    conflicts.forEach(c => {
        conflictingEvents.add(c.event1);
        conflictingEvents.add(c.event2);
    });

    workingHourConflicts.forEach(c => {
        conflictingEvents.add(c.eventName);
    });

    const hasConflicts = conflicts.length > 0;
    const hasWorkingHourConflicts = workingHourConflicts.length > 0;

    if (!hasConflicts && !hasWorkingHourConflicts) {
        div.innerHTML = "<h3>Schedule Status:</h3><p>No conflicts found! Your schedule looks good.</p>";
        div.classList.add("active");
        div.style.background = "rgba(50, 255, 100, 0.1)";
        div.style.borderColor = "rgba(50, 255, 100, 0.3)";
    } else {
        div.classList.add("active");
        div.style.background = "rgba(255, 50, 50, 0.1)";
        div.style.borderColor = "rgba(255, 50, 50, 0.3)";

        if (hasConflicts) {
            div.innerHTML += "<h3>Event Conflicts:</h3>";
            conflicts.forEach(c => {
                const p = document.createElement("p");
                p.textContent = `⚠️ ${c.event1} & ${c.event2} overlap → Reschedule: ${c.suggestedStart} - ${c.suggestedEnd}`;
                div.appendChild(p);
            });
        }

        if (hasWorkingHourConflicts) {
            div.innerHTML += "<h3>Working Hours Conflicts:</h3>";
            workingHourConflicts.forEach(c => {
                const p = document.createElement("p");
                p.className = "working-hours-conflict";
                p.textContent = `🕒 ${c.eventName} (${c.eventStart} - ${c.eventEnd}) occurs during working hours (${c.workStart} - ${c.workEnd})`;
                div.appendChild(p);
            });
        }
    }
}

// Get color based on event index (if not conflicting)
function getEventColor(index) {
    const colors = [0x00d4ff, 0x6a00ff, 0x00ff88, 0xffd700, 0xff1493, 0x00ffff];
    return colors[index % colors.length];
}

// Check if event has conflicts
function isConflicting(eventName) {
    return conflictingEvents.has(eventName);
}

function visualizeSchedule(sortedEvents, conflicts, workingHourConflicts) {
    const canvas = document.getElementById("scheduleCanvas");

    // Cancel previous animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    // Initialize scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);

    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Remove previous objects
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Timeline parameters
    const timelineLength = 24;
    const timelineHeight = 0.1;
    const eventHeight = 1.2;
    const eventDepth = 0.8;

    // Create timeline base (X-axis represents time)
    const timelineGeometry = new THREE.BoxGeometry(timelineLength, timelineHeight, 0.3);
    const timelineMaterial = new THREE.MeshPhongMaterial({
        color: 0x444444,
        emissive: 0x222222
    });
    const timeline = new THREE.Mesh(timelineGeometry, timelineMaterial);
    timeline.position.set(0, -2, 0);
    scene.add(timeline);

    // Add working hours zone
    const workStartHour = timeToMinutes(workingHours.start) / 60;
    const workEndHour = timeToMinutes(workingHours.end) / 60;
    const workDuration = workEndHour - workStartHour;
    const workZoneWidth = workDuration * (timelineLength / 24);
    const workZoneX = (workStartHour - 12) * (timelineLength / 24) + (workZoneWidth / 2);

    const workZoneGeometry = new THREE.BoxGeometry(workZoneWidth, 0.15, 0.4);
    const workZoneMaterial = new THREE.MeshPhongMaterial({
        color: 0xff8800,
        emissive: 0xff8800,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
    });
    const workZone = new THREE.Mesh(workZoneGeometry, workZoneMaterial);
    workZone.position.set(workZoneX, -2.5, 0);
    scene.add(workZone);

    // Add working hours markers
    for (let pos of [workStartHour, workEndHour]) {
        const markerGeometry = new THREE.BoxGeometry(0.15, 1, 0.4);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8800,
            emissive: 0xff8800,
            emissiveIntensity: 0.5
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        const xPos = (pos - 12) * (timelineLength / 24);
        marker.position.set(xPos, -2.5, 0);
        scene.add(marker);
    }

    // Add hour markers
    for (let hour = 0; hour <= 24; hour += 2) {
        const markerGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.3);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: hour % 4 === 0 ? 0x888888 : 0x555555
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);

        const xPos = (hour - 12) * (timelineLength / 24);
        marker.position.set(xPos, -2.3, 0);
        scene.add(marker);

        if (hour % 4 === 0) {
            const labelGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            const labelMaterial = new THREE.MeshBasicMaterial({color: 0x00d4ff});
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.set(xPos, -2.9, 0);
            scene.add(label);
        }
    }

    // Build conflict pairs map for animation
    const conflictPairs = [];
    conflicts.forEach(c => {
        conflictPairs.push({event1: c.event1, event2: c.event2});
    });

    // Create event blocks
    const eventBlocks = [];
    const eventMap = new Map(); // Map event name to block mesh
    const yPositions = {};

    sortedEvents.forEach((event, index) => {
        const [h, m] = event.start.split(":").map(Number);
        const [eh, em] = event.end.split(":").map(Number);
        const startHour = h + m / 60;
        const endHour = eh + em / 60;
        const duration = endHour - startHour;

        // X-axis: position based on start time
        const blockWidth = duration * (timelineLength / 24);
        const xPosition = (startHour - 12) * (timelineLength / 24) + (blockWidth / 2);

        // Determine if this event conflicts
        const hasConflict = isConflicting(event.name);

        // Calculate Y position (stack overlapping events)
        const startMins = h * 60 + m;
        const endMins = eh * 60 + em;
        let yOffset = 0;

        for (let existingEvent in yPositions) {
            const [existingStart, existingEnd, existingY] = yPositions[existingEvent];
            if (!(endMins <= existingStart || startMins >= existingEnd)) {
                yOffset = Math.max(yOffset, existingY + 1.5);
            }
        }

        yPositions[event.name] = [startMins, endMins, yOffset];

        // Create event block with width = duration
        const geometry = new THREE.BoxGeometry(blockWidth, eventHeight, eventDepth);
        const edges = new THREE.EdgesGeometry(geometry);

        // Color: RED for conflicts, ORANGE for working hour conflicts, normal colors otherwise
        const isWorkingHourConflict = workingHourConflicts.some(c => c.eventName === event.name);
        let color;
        if (hasConflict && !isWorkingHourConflict) {
            color = 0xff3333; // Red for event conflicts
        } else if (isWorkingHourConflict && !conflicts.some(c => c.event1 === event.name || c.event2 === event.name)) {
            color = 0xff8800; // Orange for only working hour conflicts
        } else if (hasConflict && isWorkingHourConflict) {
            color = 0xff0000; // Bright red for both types
        } else {
            color = getEventColor(index);
        }

        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: hasConflict ? 0.5 : 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        const block = new THREE.Mesh(geometry, material);

        // Add wireframe
        const lineMaterial = new THREE.LineBasicMaterial({
            color: hasConflict ? 0xff6666 : 0xffffff,
            opacity: 0.6,
            transparent: true
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        block.add(wireframe);

        // Position on timeline
        block.position.set(xPosition, -1.4 + yOffset, 0);

        // Store event data
        block.userData = {
            event: event,
            hasConflict: hasConflict,
            initialY: -1.4 + yOffset,
            pulseSpeed: hasConflict ? 4 : 2,
            pulseOffset: index * 0.5
        };

        scene.add(block);
        eventBlocks.push(block);
        eventMap.set(event.name, block);
    });

    // Create conflict connection lines (animated lightning bolts between conflicting events)
    const conflictLines = [];
    conflictPairs.forEach((pair) => {
        const block1 = eventMap.get(pair.event1);
        const block2 = eventMap.get(pair.event2);

        if (block1 && block2) {
            // Create line geometry
            const points = [];
            points.push(new THREE.Vector3(block1.position.x, block1.position.y, block1.position.z));
            points.push(new THREE.Vector3(block2.position.x, block2.position.y, block2.position.z));

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xff0000,
                linewidth: 3,
                transparent: true,
                opacity: 0.8
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.userData = {
                block1: block1,
                block2: block2,
                pulsePhase: Math.random() * Math.PI * 2
            };

            scene.add(line);
            conflictLines.push(line);

            // Add warning icon (rotating triangular prism) at midpoint
            const midX = (block1.position.x + block2.position.x) / 2;
            const midY = (block1.position.y + block2.position.y) / 2;
            const midZ = (block1.position.z + block2.position.z) / 2;

            const warningGeometry = new THREE.ConeGeometry(0.3, 0.5, 3);
            const warningMaterial = new THREE.MeshPhongMaterial({
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.7
            });
            const warning = new THREE.Mesh(warningGeometry, warningMaterial);
            warning.position.set(midX, midY + 0.5, midZ);
            warning.rotation.x = Math.PI;

            warning.userData = {
                rotationSpeed: 2,
                bobSpeed: 3,
                initialY: midY + 0.5
            };

            scene.add(warning);
            conflictLines.push(warning);
        }
    });

    // Add working hour conflict indicators
    workingHourConflicts.forEach((conflict) => {
        const block = eventMap.get(conflict.eventName);
        if (block) {
            // Add a clock icon above the event
            const clockGeometry = new THREE.TorusGeometry(0.25, 0.08, 8, 12);
            const clockMaterial = new THREE.MeshPhongMaterial({
                color: 0xff8800,
                emissive: 0xff8800,
                emissiveIntensity: 0.6
            });
            const clock = new THREE.Mesh(clockGeometry, clockMaterial);
            clock.position.set(block.position.x, block.position.y + 1, block.position.z);
            clock.rotation.x = Math.PI / 2;

            clock.userData = {
                rotationSpeed: 1.5,
                initialY: block.position.y + 1,
                bobSpeed: 2.5
            };

            scene.add(clock);
            conflictLines.push(clock);
        }
    });

    // Add grid for reference
    const gridHelper = new THREE.GridHelper(30, 30, 0x333333, 0x1a1a1a);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Position camera
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 0, 0);

    // Animation loop
    let time = 0;
    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.016;

        // Animate working hours zone
        workZone.material.emissiveIntensity = 0.2 + Math.sin(time * 1.5) * 0.1;

        // Animate event blocks
        eventBlocks.forEach((block) => {
            if (block.userData.hasConflict) {
                // Conflicts pulse faster and shake
                const pulse = Math.sin(time * block.userData.pulseSpeed) * 0.15 + 1;
                block.scale.y = pulse;
                block.material.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.3;

                // Shake effect
                block.position.y = block.userData.initialY + Math.sin(time * 8) * 0.05;
                block.rotation.z = Math.sin(time * 6) * 0.05;
            } else {
                // Normal events have subtle pulse
                const pulse = Math.sin(time * block.userData.pulseSpeed + block.userData.pulseOffset) * 0.05 + 1;
                block.scale.y = pulse;
                block.material.emissiveIntensity = 0.25 + Math.sin(time * 1.5 + block.userData.pulseOffset) * 0.1;
            }
        });

        // Animate conflict lines and warning icons
        conflictLines.forEach((item) => {
            if (item.type === 'Line') {
                // Update line positions
                const positions = item.geometry.attributes.position.array;
                positions[0] = item.userData.block1.position.x;
                positions[1] = item.userData.block1.position.y;
                positions[2] = item.userData.block1.position.z;
                positions[3] = item.userData.block2.position.x;
                positions[4] = item.userData.block2.position.y;
                positions[5] = item.userData.block2.position.z;
                item.geometry.attributes.position.needsUpdate = true;

                // Pulsing opacity
                item.material.opacity = 0.5 + Math.sin(time * 4 + item.userData.pulsePhase) * 0.3;
            } else if (item.type === 'Mesh' && item.geometry.type === 'ConeGeometry') {
                // Rotate warning icon
                item.rotation.y += item.userData.rotationSpeed * 0.016;

                // Bob up and down
                item.position.y = item.userData.initialY + Math.sin(time * item.userData.bobSpeed) * 0.2;

                // Pulse intensity
                item.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
            } else if (item.type === 'Mesh' && item.geometry.type === 'TorusGeometry') {
                // Rotate clock icon (working hour conflict)
                item.rotation.z += item.userData.rotationSpeed * 0.016;

                // Bob up and down
                item.position.y = item.userData.initialY + Math.sin(time * item.userData.bobSpeed) * 0.15;

                // Pulse intensity
                item.material.emissiveIntensity = 0.4 + Math.sin(time * 4) * 0.3;
            }
        });

        // Gentle camera movement
        const cameraRadius = 16;
        const cameraAngle = time * 0.1;
        camera.position.x = Math.sin(cameraAngle) * cameraRadius * 0.3;
        camera.position.z = cameraRadius - Math.cos(cameraAngle) * 2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const canvas = document.getElementById("scheduleCanvas");
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
});

// Add CSS animation for list items
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);