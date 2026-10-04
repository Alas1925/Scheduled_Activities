const SUPABASE_URL =
  'https://qxiufjlserfxgblftieb.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_H0hMUqF1YM5rUT9cdLAqJA_qiQfNznA';

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// =====================================================
// TEST SUPABASE CONNECTION
// =====================================================

async function testSupabaseConnection() {

  const { data, error } =
    await supabaseClient
      .from('duties')
      .select('*')
      .limit(1);

  if (error) {

    console.error(
      'Supabase connection error:',
      error
    );

    return;
  }

  console.log(
    'Supabase connected successfully:',
    data
  );
}

testSupabaseConnection();


// =====================================================
// NAVIGATION
// =====================================================

const navLinks =
  document.querySelectorAll('nav a');

function updateActiveLink() {

  const currentHash =
    window.location.hash;

  const activeLink =
    [...navLinks].find(
      link =>
        link.getAttribute('href') ===
        currentHash
    ) ||
    document.querySelector(
      'nav a[href="dashboard.html"]'
    );

  navLinks.forEach(link => {

    link.classList.toggle(
      'active',
      link === activeLink
    );

  });
}

navLinks.forEach(link => {

  link.addEventListener(
    'click',
    updateActiveLink
  );

});

window.addEventListener(
  'hashchange',
  updateActiveLink
);

updateActiveLink();


// =====================================================
// ACTIVITY ELEMENTS
// =====================================================

const calendar =
  document.querySelector('#duty-calendar');

const monthLabel =
  document.querySelector('#calendar-month');

const dutyForm =
  document.querySelector('#duty-form');

const dutyId =
  document.querySelector('#duty-id');

const dutyDate =
  document.querySelector('#duty-date');

const dutyStartTime =
  document.querySelector('#duty-start-time');

const dutyEndDate =
  document.querySelector('#duty-end-date');

const dutyType =
  document.querySelector('#duty-type');

const dutyName =
  document.querySelector('#duty-name');

const dutyLocation =
  document.querySelector('#duty-location');

const dutyAttendees =
  document.querySelector('#duty-attendees');


// =====================================================
// ATTENDED BY CHECKBOXES
// =====================================================

const dutyAttendedCPCG =
  document.getElementById(
    'duty-attended-cpcg'
  );

const dutyAttendedCG5 =
  document.getElementById(
    'duty-attended-cg5'
  );


const addButton =
  document.querySelector('#add-duty');

const updateButton =
  document.querySelector('#update-duty');

const deleteButton =
  document.querySelector('#delete-duty');

const formMessage =
  document.querySelector('#form-message');

const searchInput =
  document.querySelector('#duty-search');

const searchResults =
  document.querySelector('#search-results');

const addActivityButton =
  document.querySelector('#clear-form');

const previousMonthButton =
  document.querySelector(
    '#previous-month'
  );

const nextMonthButton =
  document.querySelector(
    '#next-month'
  );


// =====================================================
// ACTIVITY DETAILS PANEL
// =====================================================

const activityDetailsContent =
  document.querySelector(
    '#activity-details-content'
  );

const activityStatus =
  document.querySelector(
    '#activity-status'
  );

const editActivityButton =
  document.querySelector(
    '#view-edit-activity'
  );

let selectedActivityId = null;


// =====================================================
// CALENDAR DATA
// =====================================================

let visibleMonth =
  new Date(2026, 8, 1);

let duties = [];


// =====================================================
// LOAD ACTIVITIES
// =====================================================

async function loadDuties() {

  const { data, error } =
    await supabaseClient
      .from('duties')
      .select('*')
      .order('date', {
        ascending: true
      });

  if (error) {

    console.error(
      'Error loading duties:',
      error
    );

    if (formMessage) {

      formMessage.textContent =
        'Unable to load duties.';

    }

    return;
  }

  duties = data || [];

  renderCalendar();

  showSearchResults();

  if (selectedActivityId) {

    showActivityDetails(
      selectedActivityId
    );

  }

}

function getDuties() {

  return duties;

}

function makeId() {

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

}


// =====================================================
// FORMAT TIME
// =====================================================

function formatActivityTime(value) {

  if (!value) {

    return '';

  }

  const parts =
    String(value).split(':');

  if (parts.length < 2) {

    return '';

  }

  const hour =
    parts[0].padStart(2, '0');

  const minute =
    parts[1].padStart(2, '0');

  return `${hour}${minute}H`;

}


// =====================================================
// RENDER CALENDAR
// =====================================================

function renderCalendar() {

  if (
    !calendar ||
    !monthLabel
  ) {

    console.error(
      'Calendar elements were not found in dashboard.html.'
    );

    return;
  }

  const year =
    visibleMonth.getFullYear();

  const month =
    visibleMonth.getMonth();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  monthLabel.textContent =
    visibleMonth.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  calendar.replaceChildren();

  [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT'
  ].forEach(dayName => {

    const heading =
      document.createElement('div');

    heading.className =
      'weekday';

    heading.textContent =
      dayName;

    calendar.append(
      heading
    );

  });

  for (
    let blank = 0;
    blank < firstDay;
    blank += 1
  ) {

    const emptyDay =
      document.createElement('div');

    emptyDay.className =
      'day muted';

    calendar.append(
      emptyDay
    );

  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {

    const date =
      `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayDuties =
      getDuties().filter(duty => {

        const startDate =
          duty.date;

        const endDate =
          duty.end_date ||
          duty.date;

        return (
          date >= startDate &&
          date <= endDate
        );

      });

    const cell =
      document.createElement('div');

    cell.className =
      `day${dayDuties.length ? ' has-duty' : ''}`;

    cell.dataset.date =
      date;

    const number =
      document.createElement('b');

    number.textContent =
      day;

    cell.append(
      number
    );

    dayDuties.forEach(duty => {

      const entry =
        document.createElement('button');

      entry.className =
        'duty-entry';

      entry.type =
        'button';

      entry.dataset.id =
        duty.id;

      const type =
        document.createElement('strong');

      type.textContent =
        String(
          duty.type || ''
        ).toUpperCase();

      const name =
        document.createElement('span');

      name.textContent =
        duty.name || '';

      entry.append(
        type,
        name
      );

      if (
        String(duty.id) ===
        String(selectedActivityId)
      ) {

        entry.classList.add(
          'selected'
        );

      }

      cell.append(
        entry
      );

    });

    calendar.append(
      cell
    );

  }

}


// =====================================================
// CLEAR ACTIVITY FORM
// =====================================================

function clearForm(date = '') {

  if (!dutyForm) {
    return;
  }

  dutyForm.reset();

  if (dutyId) {

    dutyId.value =
      '';

  }

  if (dutyDate) {

    dutyDate.value =
      date;

  }

  if (dutyStartTime) {

    dutyStartTime.value =
      '';

  }


  // RESET ATTENDED BY CHECKBOXES

  if (dutyAttendedCPCG) {

    dutyAttendedCPCG.checked =
      false;

  }

  if (dutyAttendedCG5) {

    dutyAttendedCG5.checked =
      false;

  }


  if (addButton) {

    addButton.hidden =
      false;

  }

  if (updateButton) {

    updateButton.hidden =
      true;

  }

  if (deleteButton) {

    deleteButton.hidden =
      true;

  }

  if (formMessage) {

    formMessage.textContent =
      '';

  }

}


// =====================================================
// EDIT ACTIVITY
// =====================================================

function editDuty(id) {

  const duty =
    getDuties().find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!duty) {
    return;
  }

  if (dutyId) {

    dutyId.value =
      duty.id;

  }

  if (dutyDate) {

    dutyDate.value =
      duty.date || '';

  }

  if (dutyStartTime) {

    dutyStartTime.value =
      duty.start_time || '';

  }

  if (dutyEndDate) {

    dutyEndDate.value =
      duty.end_date || '';

  }

  if (dutyType) {

    dutyType.value =
      duty.type || '';

  }

  if (dutyName) {

    dutyName.value =
      duty.name || '';

  }

  if (dutyLocation) {

    dutyLocation.value =
      duty.location || '';

  }

  if (dutyAttendees) {

    dutyAttendees.value =
      duty.attendees || '';

  }


  // ===================================================
  // RESTORE ATTENDED BY CHECKBOXES
  // ===================================================

  const attendedByValues =
    (duty.attended_by || '')
      .split(',')
      .map(
        value =>
          value.trim()
      )
      .filter(
        value =>
          value.length > 0
      );


  if (dutyAttendedCPCG) {

    dutyAttendedCPCG.checked =
      attendedByValues.includes(
        'CPCG'
      );

  }

  if (dutyAttendedCG5) {

    dutyAttendedCG5.checked =
      attendedByValues.includes(
        'CG-5'
      );

  }


  if (addButton) {

    addButton.hidden =
      true;

  }

  if (updateButton) {

    updateButton.hidden =
      false;

  }

  if (deleteButton) {

    deleteButton.hidden =
      false;

  }

  if (formMessage) {

    formMessage.textContent =
      'Editing selected duty.';

  }

  if (dutyForm) {

    dutyForm.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });

  }

}


// =====================================================
// CLEAR ACTIVITY DETAILS
// =====================================================

function clearActivityDetails() {

  selectedActivityId =
    null;

  if (activityStatus) {

    activityStatus.textContent =
      '—';

  }

  if (activityDetailsContent) {

    activityDetailsContent.replaceChildren();

    const empty =
      document.createElement('p');

    empty.className =
      'activity-empty';

    empty.textContent =
      'Select an activity from the calendar to view its details.';

    activityDetailsContent.append(
      empty
    );

  }

  if (editActivityButton) {

    editActivityButton.hidden =
      true;

    editActivityButton.style.display =
      'none';

  }

  document
    .querySelectorAll(
      '.duty-entry.selected'
    )
    .forEach(entry => {

      entry.classList.remove(
        'selected'
      );

    });

}


// =====================================================
// ACTIVITY DATE FORMAT
// =====================================================

function formatActivityDateRange(
  start,
  end
) {

  if (!start) {

    return '—';

  }

  const startDate =
    new Date(
      `${start}T00:00:00`
    );

  const endDate =
    end
      ? new Date(
          `${end}T00:00:00`
        )
      : startDate;

  const startDay =
    String(
      startDate.getDate()
    ).padStart(
      2,
      '0'
    );

  const endDay =
    String(
      endDate.getDate()
    ).padStart(
      2,
      '0'
    );

  const startMonth =
    startDate.toLocaleDateString(
      'en-US',
      {
        month: 'long'
      }
    );

  const endMonth =
    endDate.toLocaleDateString(
      'en-US',
      {
        month: 'long'
      }
    );

  const startYear =
    startDate.getFullYear();

  const endYear =
    endDate.getFullYear();

  if (
    start === end ||
    !end
  ) {

    return `${startDay} ${startMonth} ${startYear}`;

  }

  if (
    startDate.getMonth() ===
      endDate.getMonth() &&
    startYear === endYear
  ) {

    return `${startDay}–${endDay} ${startMonth} ${startYear}`;

  }

  if (
    startYear === endYear
  ) {

    return `${startDay} ${startMonth}–${endDay} ${endMonth} ${startYear}`;

  }

  return `${startDay} ${startMonth} ${startYear}–${endDay} ${endMonth} ${endYear}`;

}


// =====================================================
// ACTIVITY DETAILS
// =====================================================

function showActivityDetails(id) {

  const duty =
    getDuties().find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!duty) {
    return;
  }

  selectedActivityId =
    duty.id;

  document
    .querySelectorAll(
      '.duty-entry.selected'
    )
    .forEach(entry => {

      entry.classList.remove(
        'selected'
      );

    });

  const selectedEntry =
    document.querySelector(
      `.duty-entry[data-id="${CSS.escape(String(duty.id))}"]`
    );

  if (selectedEntry) {

    selectedEntry.classList.add(
      'selected'
    );

  }

  if (activityStatus) {

    activityStatus.textContent =
      duty.type ||
      'Activity';

  }

  if (activityDetailsContent) {

    activityDetailsContent.replaceChildren();


    // =================================================
    // DATE
    // =================================================

    const dateItem =
      document.createElement('div');

    dateItem.className =
      'activity-detail-item';

    const dateLabel =
      document.createElement('span');

    dateLabel.className =
      'activity-detail-label';

    dateLabel.textContent =
      'Date';

    const dateValue =
      document.createElement('span');

    dateValue.className =
      'activity-detail-value';

    dateValue.textContent =
      formatActivityDateRange(
        duty.date,
        duty.end_date
      );

    dateItem.append(
      dateLabel,
      dateValue
    );


    // =================================================
    // HOUR
    // =================================================

    const timeItem =
      document.createElement('div');

    timeItem.className =
      'activity-detail-item';

    const timeLabel =
      document.createElement('span');

    timeLabel.className =
      'activity-detail-label';

    timeLabel.textContent =
      'Hour';

    const timeValue =
      document.createElement('span');

    timeValue.className =
      'activity-detail-value activity-detail-time';

    timeValue.textContent =
      formatActivityTime(
        duty.start_time
      ) || '—';

    timeItem.append(
      timeLabel,
      timeValue
    );


    // =================================================
    // TYPE
    // =================================================

    const typeItem =
      document.createElement('div');

    typeItem.className =
      'activity-detail-item';

    const typeLabel =
      document.createElement('span');

    typeLabel.className =
      'activity-detail-label';

    typeLabel.textContent =
      'Activity Type';

    const typeValue =
      document.createElement('span');

    typeValue.className =
      'activity-detail-value';

    typeValue.textContent =
      duty.type ||
      '—';

    typeItem.append(
      typeLabel,
      typeValue
    );


    // =================================================
    // NAME
    // =================================================

    const nameItem =
      document.createElement('div');

    nameItem.className =
      'activity-detail-item';

    const nameLabel =
      document.createElement('span');

    nameLabel.className =
      'activity-detail-label';

    nameLabel.textContent =
      'Activity';

    const nameValue =
      document.createElement('span');

    nameValue.className =
      'activity-detail-value';

    nameValue.textContent =
      duty.name ||
      '—';

    nameItem.append(
      nameLabel,
      nameValue
    );


    // =================================================
    // LOCATION
    // =================================================

    const locationItem =
      document.createElement('div');

    locationItem.className =
      'activity-detail-item';

    const locationLabel =
      document.createElement('span');

    locationLabel.className =
      'activity-detail-label';

    locationLabel.textContent =
      'Location';

    const locationValue =
      document.createElement('span');

    locationValue.className =
      'activity-detail-value';

    locationValue.textContent =
      duty.location ||
      '—';

    locationItem.append(
      locationLabel,
      locationValue
    );


    // =================================================
    // ATTENDEES
    // =================================================

    const attendeesItem =
      document.createElement('div');

    attendeesItem.className =
      'activity-detail-item';

    const attendeesLabel =
      document.createElement('span');

    attendeesLabel.className =
      'activity-detail-label';

    attendeesLabel.textContent =
      'List of Attendees';

    const attendeesValue =
      document.createElement('div');

    attendeesValue.className =
      'activity-detail-value';

    if (duty.attendees) {

      String(duty.attendees)
        .split('\n')
        .map(
          name =>
            name.trim()
        )
        .filter(
          name =>
            name.length > 0
        )
        .forEach(name => {

          const attendee =
            document.createElement('div');

          attendee.textContent =
            name;

          attendee.style.marginBottom =
            '4px';

          attendeesValue.append(
            attendee
          );

        });

    } else {

      attendeesValue.textContent =
        '—';

    }

    attendeesItem.append(
      attendeesLabel,
      attendeesValue
    );


    // =================================================
    // ATTENDED BY
    // =================================================

    const attendedByItem =
      document.createElement('div');

    attendedByItem.className =
      'activity-detail-item';

    const attendedByLabel =
      document.createElement('span');

    attendedByLabel.className =
      'activity-detail-label';

    attendedByLabel.textContent =
      'Attended by';

    const attendedByValue =
      document.createElement('div');

    attendedByValue.className =
      'activity-detail-value';


    const attendedByValues =
      (duty.attended_by || '')
        .split(',')
        .map(
          value =>
            value.trim()
        )
        .filter(
          value =>
            value.length > 0
        );


    if (!attendedByValues.length) {

      attendedByValue.textContent =
        '—';

    } else {

      attendedByValues.forEach(
        value => {

          const badge =
            document.createElement('span');

          badge.textContent =
            value;

          badge.style.display =
            'inline-block';

          badge.style.marginRight =
            '8px';

          badge.style.padding =
            '3px 8px';

          badge.style.borderRadius =
            '4px';

          if (value === 'CPCG') {

            badge.style.background =
              '#EAF4F8';

            badge.style.color =
              '#005B82';

            badge.style.border =
              '1px solid #B8D8E5';

          } else if (
            value === 'CG-5'
          ) {

            badge.style.background =
              '#EAF8EF';

            badge.style.color =
              '#176B3A';

            badge.style.border =
              '1px solid #B9DEC6';

          }

          attendedByValue.append(
            badge
          );

        }
      );

    }


    attendedByItem.append(
      attendedByLabel,
      attendedByValue
    );


    activityDetailsContent.append(
      dateItem,
      timeItem,
      typeItem,
      nameItem,
      locationItem,
      attendeesItem,
      attendedByItem
    );

  }


  if (editActivityButton) {

    if (
      window.cg5UserRole ===
      'admin'
    ) {

      editActivityButton.hidden =
        false;

      editActivityButton.style.display =
        'block';

    } else {

      editActivityButton.hidden =
        true;

      editActivityButton.style.display =
        'none';

    }

  }

}


// =====================================================
// SEARCH RESULTS
// =====================================================

function showSearchResults() {

  if (
    !searchInput ||
    !searchResults
  ) {

    return;

  }

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  searchResults.replaceChildren();

  if (!query) {

    searchResults.hidden =
      true;

    return;

  }

  const matches =
    getDuties().filter(duty => {

      const searchableText =
        `${duty.type || ''} ${duty.name || ''} ${duty.date || ''} ${duty.end_date || ''} ${duty.start_time || ''} ${formatActivityTime(duty.start_time)} ${duty.location || ''} ${duty.attendees || ''} ${duty.attended_by || ''}`;

      return searchableText
        .toLowerCase()
        .includes(query);

    });

  searchResults.hidden =
    false;

  if (!matches.length) {

    searchResults.textContent =
      'No matching duty assignments found.';

    return;

  }

  matches.forEach(duty => {

    const result =
      document.createElement('button');

    result.type =
      'button';

    result.dataset.id =
      duty.id;

    const timeText =
      formatActivityTime(
        duty.start_time
      );

    result.textContent =
      `${formatActivityDateRange(
        duty.date,
        duty.end_date
      )}${timeText ? ` · ${timeText}` : ''} · ${duty.type || ''}: ${duty.name || ''}`;

    searchResults.append(
      result
    );

  });

}


// =====================================================
// CALENDAR CLICK
// =====================================================

if (calendar) {

  calendar.addEventListener(
    'click',
    event => {

      const entry =
        event.target.closest(
          '.duty-entry'
        );

      if (entry) {

        showActivityDetails(
          entry.dataset.id
        );

        return;

      }

      const day =
        event.target.closest(
          '.day[data-date]'
        );

      if (
        day &&
        window.cg5UserRole ===
          'admin'
      ) {

        clearForm(
          day.dataset.date
        );

        clearActivityDetails();

      }

    }
  );

}


// =====================================================
// SAVE ACTIVITY
// =====================================================

async function saveDuty(isUpdate) {

  if (
    !dutyDate ||
    !dutyType ||
    !dutyName
  ) {

    return;

  }


  // ===================================================
  // GET ATTENDED BY CHECKBOXES
  // ===================================================

  const attendedBy = [];


  if (
    dutyAttendedCPCG &&
    dutyAttendedCPCG.checked
  ) {

    attendedBy.push(
      'CPCG'
    );

  }


  if (
    dutyAttendedCG5 &&
    dutyAttendedCG5.checked
  ) {

    attendedBy.push(
      'CG-5'
    );

  }


  // ===================================================
  // CREATE ENTRY
  // ===================================================

  const entry = {

    id:
      dutyId.value ||
      makeId(),

    date:
      dutyDate.value,

    start_time:
      dutyStartTime
        ? dutyStartTime.value || null
        : null,

    end_date:
      dutyEndDate
        ? dutyEndDate.value || null
        : null,

    type:
      dutyType.value,

    name:
      dutyName.value.trim(),

    location:
      dutyLocation
        ? dutyLocation.value.trim()
        : '',

    attendees:
      dutyAttendees
        ? dutyAttendees.value.trim()
        : '',

    attended_by:
      attendedBy.length
        ? attendedBy.join(',')
        : null

  };


  console.log(
    'ACTIVITY TO SAVE:',
    entry
  );


  // ===================================================
  // VALIDATE DATE RANGE
  // ===================================================

  if (
    entry.end_date &&
    entry.end_date < entry.date
  ) {

    if (formMessage) {

      formMessage.textContent =
        'End Date cannot be earlier than Start Date.';

    }

    return;

  }


  let result;


  // ===================================================
  // UPDATE
  // ===================================================

  if (isUpdate) {

    result =
      await supabaseClient
        .from('duties')
        .update({

          date:
            entry.date,

          start_time:
            entry.start_time,

          end_date:
            entry.end_date,

          type:
            entry.type,

          name:
            entry.name,

          location:
            entry.location,

          attendees:
            entry.attendees,

          attended_by:
            entry.attended_by

        })
        .eq(
          'id',
          entry.id
        );

  }


  // ===================================================
  // INSERT
  // ===================================================

  else {

    result =
      await supabaseClient
        .from('duties')
        .insert([
          entry
        ]);

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (result.error) {

    console.error(
      'Error saving duty:',
      result.error
    );

    if (formMessage) {

      formMessage.textContent =
        'Unable to save duty.';

    }

    return;

  }


  // ===================================================
  // MOVE CALENDAR
  // =====================================================

  visibleMonth =
    new Date(
      `${entry.date}T00:00:00`
    );


  // ===================================================
  // REFRESH DATA
  // ===================================================

  await loadDuties();


  // ===================================================
  // SHOW ACTIVITY
  // ===================================================

  showActivityDetails(
    entry.id
  );


  // ===================================================
  // RESET FORM
  // ===================================================

  clearForm();

  if (formMessage) {

    formMessage.textContent =
      isUpdate
        ? 'Duty updated.'
        : 'Duty added.';

  }

}


// =====================================================
// ACTIVITY FORM SUBMIT
// =====================================================

if (dutyForm) {

  dutyForm.addEventListener(
    'submit',
    event => {

      event.preventDefault();

      saveDuty(false);

    }
  );

}


// =====================================================
// UPDATE ACTIVITY
// =====================================================

if (updateButton) {

  updateButton.addEventListener(
    'click',
    () => {

      if (
        !dutyForm.reportValidity()
      ) {

        return;

      }

      saveDuty(true);

    }
  );

}


// =====================================================
// DELETE ACTIVITY
// =====================================================

if (deleteButton) {

  deleteButton.addEventListener(
    'click',
    async () => {

      if (
        !dutyId ||
        !dutyId.value
      ) {

        return;

      }

      const { error } =
        await supabaseClient
          .from('duties')
          .delete()
          .eq(
            'id',
            dutyId.value
          );

      if (error) {

        console.error(
          'Error deleting duty:',
          error
        );

        if (formMessage) {

          formMessage.textContent =
            'Unable to delete duty.';

        }

        return;

      }

      selectedActivityId =
        null;

      await loadDuties();

      clearForm();

      clearActivityDetails();

      if (formMessage) {

        formMessage.textContent =
          'Duty deleted.';

      }

    }
  );

}


// =====================================================
// ADD ACTIVITY BUTTON
// =====================================================

if (addActivityButton) {

  addActivityButton.addEventListener(
    'click',
    () => {

      clearForm();

      clearActivityDetails();

      if (dutyForm) {

        dutyForm.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });

      }

    }
  );

}


// =====================================================
// PREVIOUS MONTH
// =====================================================

if (previousMonthButton) {

  previousMonthButton.addEventListener(
    'click',
    () => {

      visibleMonth.setMonth(
        visibleMonth.getMonth() - 1
      );

      renderCalendar();

    }
  );

}


// =====================================================
// NEXT MONTH
// =====================================================

if (nextMonthButton) {

  nextMonthButton.addEventListener(
    'click',
    () => {

      visibleMonth.setMonth(
        visibleMonth.getMonth() + 1
      );

      renderCalendar();

    }
  );

}


// =====================================================
// SEARCH INPUT
// =====================================================

if (searchInput) {

  searchInput.addEventListener(
    'input',
    showSearchResults
  );

}


// =====================================================
// SEARCH RESULT CLICK
// =====================================================

if (searchResults) {

  searchResults.addEventListener(
    'click',
    event => {

      const result =
        event.target.closest(
          'button[data-id]'
        );

      if (!result) {

        return;

      }

      showActivityDetails(
        result.dataset.id
      );

    }
  );

}


// =====================================================
// EDIT BUTTON
// =====================================================

if (editActivityButton) {

  editActivityButton.addEventListener(
    'click',
    () => {

      if (
        window.cg5UserRole ===
          'admin' &&
        selectedActivityId
      ) {

        editDuty(
          selectedActivityId
        );

      }

    }
  );

}


// =====================================================
// LEAVE STATUS
// =====================================================

const leaveStorageKey =
  'cg5LeaveStatus';

const leaveList =
  document.querySelector(
    '#leave-list'
  );

const leaveForm =
  document.querySelector(
    '#leave-form'
  );

const leaveId =
  document.querySelector(
    '#leave-id'
  );

const leaveType =
  document.querySelector(
    '#leave-type'
  );

const leaveName =
  document.querySelector(
    '#leave-name'
  );

const leavePeriod =
  document.querySelector(
    '#leave-period'
  );

const saveLeaveButton =
  document.querySelector(
    '#save-leave'
  );

const deleteLeaveButton =
  document.querySelector(
    '#delete-leave'
  );

const leaveMessage =
  document.querySelector(
    '#leave-message'
  );

const leavePanel =
  document.querySelector(
    '#documents'
  );

const toggleLeaveEdit =
  document.querySelector(
    '#toggle-leave-edit'
  );


const defaultLeaves = [

  {
    id: 'leave-1',
    type: 'RNR',
    name: 'ASN Rollo PCG',
    period: '04 – 15 September 2026'
  },

  {
    id: 'leave-2',
    type: 'Sick Call',
    name: 'ASW Yungco PCG',
    period: '04 – 15 September 2026'
  },

  {
    id: 'leave-3',
    type: 'Mandatory Leave',
    name: 'ASW Tempiatura PCG',
    period: '04 – 15 September 2026'
  }

];


function getLeaves() {

  const savedLeaves =
    localStorage.getItem(
      leaveStorageKey
    );

  return savedLeaves
    ? JSON.parse(savedLeaves)
    : defaultLeaves;

}


function saveLeaves(leaves) {

  localStorage.setItem(
    leaveStorageKey,
    JSON.stringify(leaves)
  );

}


function renderLeaves() {

  if (!leaveList) {

    return;

  }

  leaveList.replaceChildren();

  const leaves =
    getLeaves();

  if (!leaves.length) {

    const empty =
      document.createElement('li');

    empty.className =
      'empty-leave';

    empty.textContent =
      'No leave records yet.';

    leaveList.append(
      empty
    );

    return;

  }

  leaves.forEach(leave => {

    const item =
      document.createElement('li');

    const badge =
      document.createElement('span');

    badge.className =
      'file';

    badge.textContent =
      leave.type;

    const details =
      document.createElement('div');

    const name =
      document.createElement('h3');

    name.textContent =
      leave.name;

    const period =
      document.createElement('p');

    period.textContent =
      leave.period;

    details.append(
      name,
      period
    );

    const actions =
      document.createElement('div');

    actions.className =
      'leave-actions';

    const update =
      document.createElement('button');

    update.type =
      'button';

    update.dataset.id =
      leave.id;

    update.textContent =
      'Update';

    const remove =
      document.createElement('button');

    remove.type =
      'button';

    remove.dataset.deleteId =
      leave.id;

    remove.textContent =
      'Delete';

    actions.append(
      update,
      remove
    );

    item.append(
      badge,
      details,
      actions
    );

    leaveList.append(
      item
    );

  });

}


// =====================================================
// LEAVE FORM
// =====================================================

function openLeaveForm(id = '') {

  if (!leaveForm) {

    return;

  }

  leaveForm.hidden =
    false;

  if (leaveMessage) {

    leaveMessage.textContent =
      '';

  }

  const leave =
    getLeaves().find(
      item =>
        item.id === id
    );

  if (leave) {

    leaveId.value =
      leave.id;

    leaveType.value =
      leave.type;

    leaveName.value =
      leave.name;

    leavePeriod.value =
      leave.period;

    saveLeaveButton.textContent =
      'Update leave';

    deleteLeaveButton.hidden =
      false;

  } else {

    leaveForm.reset();

    leaveId.value =
      '';

    saveLeaveButton.textContent =
      'Add leave';

    deleteLeaveButton.hidden =
      true;

  }

}


function closeLeaveForm() {

  if (!leaveForm) {

    return;

  }

  leaveForm.hidden =
    true;

  leaveForm.reset();

  if (leaveId) {

    leaveId.value =
      '';

  }

}


// =====================================================
// LEAVE BUTTONS
// =====================================================

const addLeaveButton =
  document.querySelector(
    '#add-leave'
  );

if (addLeaveButton) {

  addLeaveButton.addEventListener(
    'click',
    () =>
      openLeaveForm()
  );

}


const cancelLeaveButton =
  document.querySelector(
    '#cancel-leave'
  );

if (cancelLeaveButton) {

  cancelLeaveButton.addEventListener(
    'click',
    closeLeaveForm
  );

}


if (toggleLeaveEdit) {

  toggleLeaveEdit.addEventListener(
    'click',
    () => {

      const isEditing =
        leavePanel.classList.toggle(
          'editing'
        );

      toggleLeaveEdit.textContent =
        isEditing
          ? 'Done'
          : 'Edit';

      if (!isEditing) {

        closeLeaveForm();

      }

    }
  );

}


// =====================================================
// LEAVE LIST CLICK
// =====================================================

if (leaveList) {

  leaveList.addEventListener(
    'click',
    event => {

      const update =
        event.target.closest(
          'button[data-id]'
        );

      const remove =
        event.target.closest(
          'button[data-delete-id]'
        );

      if (update) {

        openLeaveForm(
          update.dataset.id
        );

      }

      if (remove) {

        saveLeaves(
          getLeaves().filter(
            leave =>
              leave.id !==
              remove.dataset.deleteId
          )
        );

        renderLeaves();

        closeLeaveForm();

      }

    }
  );

}


// =====================================================
// SAVE LEAVE
// =====================================================

if (leaveForm) {

  leaveForm.addEventListener(
    'submit',
    event => {

      event.preventDefault();

      const leaves =
        getLeaves();

      const entry = {

        id:
          leaveId.value ||
          makeId(),

        type:
          leaveType.value.trim(),

        name:
          leaveName.value.trim(),

        period:
          leavePeriod.value.trim()

      };

      const index =
        leaves.findIndex(
          leave =>
            leave.id ===
            entry.id
        );

      if (index >= 0) {

        leaves[index] =
          entry;

      } else {

        leaves.push(
          entry
        );

      }

      saveLeaves(
        leaves
      );

      renderLeaves();

      if (leaveMessage) {

        leaveMessage.textContent =
          index >= 0
            ? 'Leave record updated.'
            : 'Leave record added.';

      }

      setTimeout(
        closeLeaveForm,
        800
      );

    }
  );

}


// =====================================================
// DELETE LEAVE
// =====================================================

if (deleteLeaveButton) {

  deleteLeaveButton.addEventListener(
    'click',
    () => {

      if (
        !leaveId ||
        !leaveId.value
      ) {

        return;

      }

      saveLeaves(
        getLeaves().filter(
          leave =>
            leave.id !==
            leaveId.value
        )
      );

      renderLeaves();

      closeLeaveForm();

    }
  );

}


// =====================================================
// INITIAL LEAVE DISPLAY
// =====================================================

renderLeaves();


// =====================================================
// USER ROLE / PERMISSIONS
// =====================================================

async function applyUserRole() {

  const {
    data: { user },
    error: authError
  } =
    await supabaseClient.auth.getUser();

  if (
    authError ||
    !user
  ) {

    window.location.href =
      'index.html';

    return;

  }

  const {
    data: profile,
    error: profileError
  } =
    await supabaseClient
      .from('profiles')
      .select('role')
      .eq(
        'id',
        user.id
      )
      .single();

  if (
    profileError ||
    !profile
  ) {

    console.error(
      'Unable to get user role:',
      profileError
    );

    return;

  }

  const isAdmin =
    profile.role === 'admin';

  console.log(
    'Logged in as:',
    profile.role
  );

  window.cg5UserRole =
    profile.role;


  // ===================================================
  // ACTIVITY CONTROLS
  // ===================================================

  if (addActivityButton) {

    addActivityButton.style.display =
      isAdmin
        ? ''
        : 'none';

  }

  if (dutyForm) {

    dutyForm.style.display =
      isAdmin
        ? ''
        : 'none';

  }


  // ===================================================
  // EDIT BUTTON
  // ===================================================

  if (editActivityButton) {

    editActivityButton.style.display =
      isAdmin &&
      selectedActivityId
        ? ''
        : 'none';

  }


  // ===================================================
  // LEAVE CONTROLS
  // ===================================================

  const addLeave =
    document.querySelector(
      '#add-leave'
    );

  const editLeave =
    document.querySelector(
      '#toggle-leave-edit'
    );

  if (addLeave) {

    addLeave.style.display =
      isAdmin
        ? ''
        : 'none';

  }

  if (editLeave) {

    editLeave.style.display =
      isAdmin
        ? ''
        : 'none';

  }


  // ===================================================
  // USER MESSAGE CLEANUP
  // ===================================================

  if (!isAdmin) {

    if (formMessage) {

      formMessage.textContent =
        '';

    }

    if (leaveMessage) {

      leaveMessage.textContent =
        '';

    }

  }


  // ===================================================
  // REFRESH EDIT BUTTON
  // ===================================================

  if (
    selectedActivityId &&
    isAdmin
  ) {

    if (editActivityButton) {

      editActivityButton.style.display =
        '';

    }

  }

}


// =====================================================
// START DASHBOARD
// =====================================================

async function initializeDashboard() {

  await applyUserRole();

  await loadDuties();

  clearActivityDetails();

}

initializeDashboard();