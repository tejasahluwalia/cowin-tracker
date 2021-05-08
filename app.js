const axios = require('axios');
const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require('toad-scheduler');

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const scheduler = new ToadScheduler();
let isBooked = false;

let token = '';
let url =
  'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=571&date=08-05-2021';
let preferredCenter = '';
let preferredDate = '';
let preferredSlot = '';
let beneficiaries = [];

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
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
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
        availableCenters.map((center) => {
          if (center.id == preferredCenter && center.date == preferredDate) {
            axios
              .post(
                'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
                {
                  center_id: center.id,
                  session_id: center.session_id,
                  beneficiaries: beneficiaries,
                  slot: preferredSlot,
                  dose: 1,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                  },
                }
              )
              .then((res) => {
                if (res.response.status == 200) {
                  isBooked = true;
                  return;
                }
              })
              .catch((err) => console.error(err.response.data.error));
          }
        });
        return;
      } else {
        return;
      }
    });
}

async function getBeneficiaries() {
  return axios
    .get('https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      },
    })
    .then((response) => {
      console.log(response.data);
      return;
    });
}

function getCenters() {
  return axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      },
    })
    .then((res) => {
      res.data.centers.map((center) => {
        console.log(
          `Name: ${center.name}\nID: ${center.center_id}\nSlots: ${center.sessions[0].slots}\n-----\n`
        );
      });
      return;
    });
}

const task = new AsyncTask(
  'Check Vaccine Center Availability',
  checkAvailability(),
  (err) => {
    console.error(err.response.statusText);
    scheduler.stop();
  }
);

// getBeneficiaries();
// getCenters();

// const job = new SimpleIntervalJob({ seconds: 5 }, task);
// scheduler.addSimpleIntervalJob(job);
