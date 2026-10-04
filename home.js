console.log("🔥 HOME.JS LOADED - NO HOUR DISPLAY");

const SUPABASE_URL =
  "https://qxiufjlserfxgblftieb.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_H0hMUqF1YM5rUT9cdLAqJA_qiQfNznA";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

let homeActivities = [];

let currentMonth =
  new Date().getMonth();

let currentYear =
  new Date().getFullYear();


const monthlyActivities =
  document.getElementById("monthly-activities");

const monthLabel =
  document.getElementById("month-label");

const prevMonth =
  document.getElementById("prev-month");

const nextMonth =
  document.getElementById("next-month");

const eventTitle =
  document.getElementById("event-title");

const eventDescription =
  document.getElementById("event-description");

const eventDate =
  document.getElementById("event-date");

const eventDateFull =
  document.getElementById("event-date-full");

const eventLabel =
  document.getElementById("event-label");

const userAvatar =
  document.getElementById("user-avatar");

const logoutButton =
  document.getElementById("logout-button");


/* =========================
   MONTH NAMES
========================= */

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];


/* =========================
   LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadActivities();
  }
);


/* =========================
   LOAD ACTIVITIES
========================= */

async function loadActivities() {

  console.log("Loading activities...");

  try {

    const { data, error } =
      await supabaseClient
        .from("duties")
        .select("*");

    if (error) {

      console.error(
        "Error loading activities:",
        error
      );

      if (monthlyActivities) {

        monthlyActivities.innerHTML = `
          <div class="empty-state">
            Unable to load activities.
          </div>
        `;
      }

      return;
    }


    console.log(
      "Activities loaded:",
      data
    );


    homeActivities =
      (data || []).map(
        activity => {

          return {

            id:
              activity.id,

            date:
              normalizeDate(
                activity.date
              ),

            end_date:
              normalizeDate(
                activity.end_date
              ),

            /*
              Keep start_time.

              It is still used internally
              for sorting only.

              It is NOT displayed on Home.
            */

            start_time:
              activity.start_time || "",

            type:
              activity.type || "",

            name:
              activity.name || "",

            location:
              activity.location || "",

            attendees:
              activity.attendees || "",

            attended_by:
              activity.attended_by || ""
          };
        }
      );


    showUpcomingEvent();


    showMonthlyActivities(
      getActivitiesForMonth(
        currentYear,
        currentMonth
      )
    );


  } catch (error) {

    console.error(
      "Unexpected error:",
      error
    );

    if (monthlyActivities) {

      monthlyActivities.innerHTML = `
        <div class="empty-state">
          Unable to load activities.
        </div>
      `;
    }
  }
}


/* =========================
   UPCOMING EVENT
========================= */

function showUpcomingEvent() {

  if (!eventTitle) {
    return;
  }


  if (!homeActivities.length) {

    if (eventLabel) {

      eventLabel.textContent =
        "UPCOMING EVENT";
    }

    eventTitle.textContent =
      "No upcoming activities";

    if (eventDescription) {

      eventDescription.textContent =
        "There are currently no scheduled activities.";
    }

    if (eventDate) {
      eventDate.textContent = "—";
    }

    if (eventDateFull) {
      eventDateFull.textContent = "—";
    }

    return;
  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  /*
    Find upcoming activities.

    start_time is still used for sorting,
    but is NOT displayed.
  */

  const upcoming =
    homeActivities
      .filter(
        activity => {

          if (!activity.date) {
            return false;
          }

          const activityDate =
            new Date(
              activity.date
            );

          return (
            activityDate >=
            today
          );
        }
      )
      .sort(
        (a, b) => {

          const dateDifference =
            new Date(a.date) -
            new Date(b.date);


          if (
            dateDifference !== 0
          ) {

            return dateDifference;
          }


          return String(
            a.start_time || ""
          ).localeCompare(
            String(
              b.start_time || ""
            )
          );
        }
      );


  if (!upcoming.length) {

    if (eventLabel) {

      eventLabel.textContent =
        "UPCOMING EVENT";
    }

    eventTitle.textContent =
      "No upcoming activities";


    if (eventDescription) {

      eventDescription.textContent =
        "There are no upcoming activities scheduled.";
    }


    if (eventDate) {
      eventDate.textContent = "—";
    }


    if (eventDateFull) {
      eventDateFull.textContent = "—";
    }


    return;
  }


  const activity =
    upcoming[0];


  const startDate =
    new Date(
      activity.date
    );


  const endDate =
    activity.end_date
      ? new Date(
          activity.end_date
        )
      : null;


  let dateText =
    String(
      startDate.getDate()
    ).padStart(
      2,
      "0"
    );


  if (
    endDate &&
    endDate > startDate
  ) {

    dateText +=
      "–" +
      String(
        endDate.getDate()
      ).padStart(
        2,
        "0"
      );
  }


  if (eventLabel) {

    eventLabel.textContent =
      activity.type
        ? activity.type.toUpperCase()
        : "UPCOMING EVENT";
  }


  eventTitle.textContent =
    activity.name ||
    "Untitled Activity";


  /*
    HOME DESCRIPTION

    No Hour.

    Only:
    Attended By
    Location
  */

  let descriptionParts = [];


  if (activity.attended_by) {

    const attendedByText =
      String(
        activity.attended_by
      )
        .split(",")
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean)
        .join(" ");


    if (attendedByText) {

      descriptionParts.push(
        attendedByText
      );
    }
  }


  if (activity.location) {

    descriptionParts.push(
      activity.location
    );
  }


  if (eventDescription) {

    eventDescription.textContent =
      descriptionParts.length
        ? descriptionParts.join(" • ")
        : "Scheduled activity";
  }


  if (eventDate) {

    eventDate.textContent =
      dateText;
  }


  if (eventDateFull) {

    eventDateFull.textContent =
      monthNames[
        startDate.getMonth()
      ] +
      " " +
      startDate.getFullYear();
  }
}


/* =========================
   GET MONTH ACTIVITIES
========================= */

function getActivitiesForMonth(
  year,
  month
) {

  return homeActivities.filter(
    activity => {

      if (!activity.date) {
        return false;
      }


      const date =
        new Date(
          activity.date
        );


      return (
        date.getFullYear() ===
          year &&
        date.getMonth() ===
          month
      );
    }
  );
}


/* =========================
   SHOW MONTHLY ACTIVITIES
========================= */

function showMonthlyActivities(
  activities
) {

  if (!monthlyActivities) {
    return;
  }


  monthlyActivities.innerHTML =
    "";


  if (
    !activities ||
    activities.length === 0
  ) {

    monthlyActivities.innerHTML = `
      <div class="empty-state">
        No activities scheduled for this month.
      </div>
    `;

    return;
  }


  /* =========================
     SORT ACTIVITIES
  ========================= */

  const sortedActivities =
    [...activities].sort(
      (a, b) => {

        const dateA =
          new Date(a.date);

        const dateB =
          new Date(b.date);


        if (
          dateA - dateB !== 0
        ) {

          return (
            dateA - dateB
          );
        }


        /*
          Keep Hour for sorting,
          but don't display it.
        */

        const timeA =
          String(
            a.start_time || ""
          );

        const timeB =
          String(
            b.start_time || ""
          );


        if (
          timeA !== timeB
        ) {

          return timeA.localeCompare(
            timeB
          );
        }


        return (
          a.name || ""
        ).localeCompare(
          b.name || ""
        );
      }
    );


  /* =========================
     GROUP DATES
  ========================= */

  const groups = [];


  sortedActivities.forEach(
    activity => {

      const startDate =
        normalizeDate(
          activity.date
        );


      const endDate =
        normalizeDate(
          activity.end_date
        );


      const isValidMultiDay =
        endDate &&
        startDate &&
        endDate >
          startDate;


      let groupKey;


      if (
        isValidMultiDay
      ) {

        groupKey =
          `${startDate}__${endDate}`;

      } else {

        groupKey =
          `${startDate}__${startDate}`;
      }


      let group =
        groups.find(
          g =>
            g.key ===
            groupKey
        );


      if (!group) {

        group = {

          key:
            groupKey,

          startDate:
            startDate,

          endDate:
            isValidMultiDay
              ? endDate
              : startDate,

          activities:
            []
        };


        groups.push(
          group
        );
      }


      group.activities.push(
        activity
      );
    }
  );


  /* =========================
     SORT GROUPS
  ========================= */

  groups.sort(
    (a, b) => {

      const difference =
        new Date(
          a.startDate
        ) -
        new Date(
          b.startDate
        );


      if (
        difference !== 0
      ) {

        return difference;
      }


      return 0;
    }
  );


  /* =========================
     CREATE GROUPS
  ========================= */

  groups.forEach(
    group => {

      const groupElement =
        document.createElement(
          "div"
        );


      groupElement.className =
        "activity-date-group";


      /* =========================
         DATE BOX
      ========================= */

      const dateBox =
        document.createElement(
          "div"
        );


      dateBox.className =
        "activity-date";


      const start =
        new Date(
          group.startDate
        );


      const day =
        String(
          start.getDate()
        ).padStart(
          2,
          "0"
        );


      let dateText =
        day;


      if (
        group.endDate &&
        group.endDate !==
          group.startDate
      ) {

        const end =
          new Date(
            group.endDate
          );


        const endDay =
          String(
            end.getDate()
          ).padStart(
            2,
            "0"
          );


        dateText =
          `${day}–${endDay}`;
      }


      dateBox.innerHTML = `
        <strong>
          ${dateText}
        </strong>

        <span>
          ${
            monthNames[
              start.getMonth()
            ]
              .substring(
                0,
                3
              )
              .toUpperCase()
          }
        </span>
      `;


      /* =========================
         ACTIVITY INFO GROUP
      ========================= */

      const infoGroup =
        document.createElement(
          "div"
        );


      infoGroup.className =
        "activity-info-group";


      /* =========================
         EACH ACTIVITY
      ========================= */

      group.activities.forEach(
        activity => {

          const info =
            document.createElement(
              "div"
            );


          info.className =
            "activity-info";


          /* =========================
             ACTIVITY TYPE
          ========================= */

          const typeColumn =
            document.createElement(
              "div"
            );


          typeColumn.className =
            "activity-type-column";


          if (activity.type) {

            const type =
              document.createElement(
                "span"
              );


            type.className =
              "activity-type";


            type.textContent =
              activity.type;


            typeColumn.appendChild(
              type
            );
          }


          /* =========================
             ACTIVITY DETAILS
          ========================= */

          const right =
            document.createElement(
              "div"
            );


          right.className =
            "activity-right";


          /* ACTIVITY NAME */

          const name =
            document.createElement(
              "strong"
            );


          name.textContent =
            activity.name ||
            "Untitled Activity";


          right.appendChild(
            name
          );


          /* =========================
             LOCATION
          ========================= */

          if (activity.location) {

            const location =
              document.createElement(
                "span"
              );


            location.className =
              "activity-location";


            location.textContent =
              activity.location;


            right.appendChild(
              location
            );
          }


          /* =========================
             ATTENDED BY
          ========================= */

          if (activity.attended_by) {

            const list =
              String(
                activity.attended_by
              )
                .split(",")
                .map(
                  item =>
                    item.trim()
                )
                .filter(
                  item =>
                    item === "CPCG" ||
                    item === "CG-5"
                );


            if (list.length) {

              const attended =
                document.createElement(
                  "div"
                );


              attended.className =
                "attended-by-group";


              list.forEach(
                person => {

                  const badge =
                    document.createElement(
                      "span"
                    );


                  badge.className =
                    "attended-by-badge";


                  if (
                    person === "CPCG"
                  ) {

                    badge.classList.add(
                      "attended-by-cpcg"
                    );

                  } else {

                    badge.classList.add(
                      "attended-by-cg5"
                    );
                  }


                  badge.textContent =
                    person;


                  attended.appendChild(
                    badge
                  );
                }
              );


              right.appendChild(
                attended
              );
            }
          }


          /* =========================
             ADD TO ACTIVITY ROW
          ========================= */

          info.appendChild(
            typeColumn
          );


          info.appendChild(
            right
          );


          infoGroup.appendChild(
            info
          );
        }
      );


      /* =========================
         ADD GROUP TO LIST
      ========================= */

      groupElement.appendChild(
        dateBox
      );


      groupElement.appendChild(
        infoGroup
      );


      monthlyActivities.appendChild(
        groupElement
      );
    }
  );
}


/* =========================
   NORMALIZE DATE
========================= */

function normalizeDate(value) {

  if (!value) {
    return "";
  }


  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {

    return value;
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-${month}-${day}`
  );
}


/* =========================
   UPDATE MONTH DISPLAY
========================= */

function updateMonthDisplay() {

  if (monthLabel) {

    monthLabel.textContent =
      `${monthNames[currentMonth]} ${currentYear}`;
  }


  const activities =
    getActivitiesForMonth(
      currentYear,
      currentMonth
    );


  showMonthlyActivities(
    activities
  );
}


/* =========================
   PREVIOUS MONTH
========================= */

if (prevMonth) {

  prevMonth.addEventListener(
    "click",
    () => {

      currentMonth--;


      if (
        currentMonth < 0
      ) {

        currentMonth = 11;
        currentYear--;
      }


      updateMonthDisplay();
    }
  );
}


/* =========================
   NEXT MONTH
========================= */

if (nextMonth) {

  nextMonth.addEventListener(
    "click",
    () => {

      currentMonth++;


      if (
        currentMonth > 11
      ) {

        currentMonth = 0;
        currentYear++;
      }


      updateMonthDisplay();
    }
  );
}


/* =========================
   LOGOUT
========================= */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        await supabaseClient.auth.signOut();

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );
      }


      window.location.href =
        "index.html";
    }
  );
}