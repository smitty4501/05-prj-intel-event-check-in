const ATTENDANCE_GOAL = 50;
const STORAGE_KEY = "intelSummitAttendance";

const teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables"
};

let attendees = [];
let totalCount = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0
};

const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const celebration = document.getElementById("celebration");
const storageNotice = document.getElementById("storageNotice");
const attendeeCount = document.getElementById("attendeeCount");
const attendanceGoal = document.getElementById("attendanceGoal");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const emptyAttendeeList = document.getElementById("emptyAttendeeList");

function isValidAttendance(data) {
  if (
    !Array.isArray(data.attendees) ||
    !Number.isInteger(data.totalCount) ||
    data.totalCount !== data.attendees.length ||
    !data.teamCounts
  ) {
    return false;
  }

  const expectedCounts = {
    water: 0,
    zero: 0,
    power: 0
  };

  for (let i = 0; i < data.attendees.length; i += 1) {
    const attendee = data.attendees[i];

    if (
      !attendee ||
      typeof attendee.name !== "string" ||
      !Object.prototype.hasOwnProperty.call(teamLabels, attendee.team)
    ) {
      return false;
    }

    expectedCounts[attendee.team] += 1;
  }

  return (
    data.teamCounts.water === expectedCounts.water &&
    data.teamCounts.zero === expectedCounts.zero &&
    data.teamCounts.power === expectedCounts.power
  );
}

function loadAttendance() {
  try {
    const savedAttendance = localStorage.getItem(STORAGE_KEY);

    if (savedAttendance) {
      const parsedAttendance = JSON.parse(savedAttendance);

      if (!isValidAttendance(parsedAttendance)) {
        throw new Error("Saved attendance data is invalid.");
      }

      attendees = parsedAttendance.attendees;
      totalCount = parsedAttendance.totalCount;
      teamCounts = parsedAttendance.teamCounts;
    }
  } catch (error) {
    storageNotice.textContent =
      "Saved attendance could not be loaded. Check your browser storage.";
    storageNotice.hidden = false;
  }
}

function saveAttendance() {
  const attendanceData = {
    attendees: attendees,
    totalCount: totalCount,
    teamCounts: teamCounts
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
    storageNotice.hidden = true;
  } catch (error) {
    storageNotice.textContent =
      "Check-in was added, but attendance could not be saved to this browser.";
    storageNotice.hidden = false;
  }
}

function getWinningTeams() {
  let highestCount = 0;
  const winningTeams = [];

  for (const team in teamCounts) {
    if (teamCounts[team] > highestCount) {
      highestCount = teamCounts[team];
      winningTeams.length = 0;
      winningTeams.push(teamLabels[team]);
    } else if (teamCounts[team] === highestCount && highestCount > 0) {
      winningTeams.push(teamLabels[team]);
    }
  }

  return {
    names: winningTeams.join(", "),
    count: highestCount
  };
}

function renderAttendees() {
  attendeeList.textContent = "";
  emptyAttendeeList.hidden = attendees.length > 0;

  for (let i = 0; i < attendees.length; i += 1) {
    const attendeeItem = document.createElement("li");
    const name = document.createElement("span");
    const team = document.createElement("span");

    attendeeItem.className = "attendee-row";
    name.className = "attendee-name";
    team.className = "attendee-team";
    name.textContent = attendees[i].name;
    team.textContent = teamLabels[attendees[i].team];

    attendeeItem.appendChild(name);
    attendeeItem.appendChild(team);
    attendeeList.appendChild(attendeeItem);
  }
}

function renderAttendance() {
  const progressPercentage = Math.min(
    (totalCount / ATTENDANCE_GOAL) * 100,
    100
  );

  attendeeCount.textContent = totalCount;
  attendanceGoal.textContent = ATTENDANCE_GOAL;
  progressBar.style.width = `${progressPercentage}%`;
  progressBar.setAttribute(
    "aria-valuenow",
    Math.min(totalCount, ATTENDANCE_GOAL)
  );
  progressBar.setAttribute("aria-valuemax", ATTENDANCE_GOAL);
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;

  renderAttendees();

  if (totalCount >= ATTENDANCE_GOAL) {
    const winningTeam = getWinningTeams();
    celebration.textContent = `Goal reached! Congratulations to ${winningTeam.names}, leading with ${winningTeam.count} attendees!`;
    celebration.hidden = false;
  } else {
    celebration.hidden = true;
  }
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;

  if (!name || !Object.prototype.hasOwnProperty.call(teamLabels, team)) {
    greeting.textContent = "Enter an attendee name and select a team.";
    greeting.classList.remove("success-message");
    greeting.classList.add("error-message");
    return;
  }

  attendees.push({
    name: name,
    team: team
  });
  totalCount += 1;
  teamCounts[team] += 1;

  greeting.textContent = `Welcome, ${name} from ${teamLabels[team]}!`;
  greeting.classList.remove("error-message");
  greeting.classList.add("success-message");

  saveAttendance();
  renderAttendance();
  checkInForm.reset();
  attendeeNameInput.focus();
});

loadAttendance();
renderAttendance();