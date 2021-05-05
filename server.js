const axios = require('axios');
const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require('toad-scheduler');

const scheduler = new ToadScheduler();
let isBooked = false;

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxZTMwMDM1OC0yMjU4LTRiZTEtYmNlYS03ZWM2Nzc0ZmEzZTUiLCJ1c2VyX2lkIjoiMWUzMDAzNTgtMjI1OC00YmUxLWJjZWEtN2VjNjc3NGZhM2U1IiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo5ODg0MTQzNDM0LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjYwODAyODcyNDM4NzkwLCJ1YSI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85MC4wLjQ0MzAuOTMgU2FmYXJpLzUzNy4zNiIsImRhdGVfbW9kaWZpZWQiOiIyMDIxLTA1LTA1VDAyOjA2OjQyLjIwNVoiLCJpYXQiOjE2MjAxODA0MDIsImV4cCI6MTYyMDE4MTMwMn0.GoPVsX0RIbn_co9SYJAYqQrKSwSGs0z14Y9mMy8jSV4';
const url =
  'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=571&date=04-05-2021';

async function checkAvailability() {
  if (isBooked) {
    return;
  }
  let availableCenters = [];
  return axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      let centers = res.data.centers;
      centers.map((center) => {
        let sessions = center.sessions;
        sessions.map((session) => {
          if (session.min_age_limit == 18 && session.available_capacity > 0) {
            availableCenters.push({
              name: center.name,
              address: center.address,
              pincode: center.pincode,
              date: session.date,
              available_capacity: session.available_capacity,
              session_id: session.session_id,
              slots: session.slots,
            });
          }
        });
      });
    })
    .then(() => {
      if (availableCenters.length > 0) {
        console.log(new Date());
        console.log(availableCenters);
        // availableCenters.map((center) => {
        //   if (
        //     center.name == 'Apollo Mains Greams Road' &&
        //     center.date > '04-05-2021'
        //   ) {
        //     axios
        //       .post(
        //         'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
        //         {
        //           center_id: 603553,
        //           session_id: center.session_id,
        //           beneficiaries: ['60802872438790'],
        //           slot: center.slots[0],
        //           dose: 1,
        //         },
        //         {
        //           headers: {
        //             Authorization: `Bearer ${token}`,
        //             'Content-Type': 'application/json',
        //           },
        //         }
        //       )
        //       .then((res) => {
        //         if (res.response.status == 200) {
        //           isBooked = true;
        //           return
        //         }
        //       })
        //       .catch((err) => console.error(err.response.data.error));
        //   }
        // });
        return;
      } else {
        return;
      }
    });
}

const task = new AsyncTask(
  'Check Vaccine Center Availability',
  checkAvailability,
  (err) => console.error(err.response.statusText)
);

const job = new SimpleIntervalJob({ seconds: 5 }, task);
scheduler.addSimpleIntervalJob(job);
