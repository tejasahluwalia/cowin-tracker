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

let token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxZTMwMDM1OC0yMjU4LTRiZTEtYmNlYS03ZWM2Nzc0ZmEzZTUiLCJ1c2VyX2lkIjoiMWUzMDAzNTgtMjI1OC00YmUxLWJjZWEtN2VjNjc3NGZhM2U1IiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo5ODg0MTQzNDM0LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjYwODAyODcyNDM4NzkwLCJzZWNyZXRfa2V5IjoiYjVjYWIxNjctNzk3Ny00ZGYxLTgwMjctYTYzYWExNDRmMDRlIiwidWEiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvOTAuMC40NDMwLjkzIFNhZmFyaS81MzcuMzYiLCJkYXRlX21vZGlmaWVkIjoiMjAyMS0wNS0xMFQwNjoxNjoyOC40NzJaIiwiaWF0IjoxNjIwNjI3Mzg4LCJleHAiOjE2MjA2MjgyODh9.2W9M57ThNVAIIthPwW6-81EuBPIN8aeJBWfrvkdve2c';
let url =
  'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=563&date=10-05-2021';
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
          if (
            session.min_age_limit == 45 &&
            (center.name == 'Gobi GH' || center.name == 'Gobi GH 1')
          ) {
            availableCenters.push({
              name: center.name,
              address: center.address,
              pincode: center.pincode,
              date: session.date,
              available_capacity: session.available_capacity,
              session_id: session.session_id,
              slots: session.slots,
              date: session.date,
            });
          }
        });
      });
    })
    .then(() => {
      if (availableCenters.length > 0) {
        console.log(new Date());
        availableCenters.map((center) => {
          console.log(
            `Name: ${center.name}\nSlots: ${center.slots}\nAddress: ${center.address}\nDate: ${center.date}\nAvailable Capacity: ${center.available_capacity}\n-----\n`
          );
          if (center.available_capacity > 0) {
            axios.post(
              'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
              {
                center_id: center.id,
                session_id: center.session_id,
                beneficiaries: beneficiaries,
                slot: center.sessions[0],
                dose: 2,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                },
              }
            );
          }

          // .then((res) => {
          //   if (res.response.status == 200) {
          //     isBooked = true;
          //     return;
          //   }
          // });
        });
        return;
      } else {
        console.log(new Date());
        console.log('No slots available at selected centers');
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
          `Name: ${center.name}\nID: ${center.center_id}\nSlots: ${center.sessions[0].slots}\nAddress: ${center.address}\n-----\n`
        );
      });
      return;
    });
}

const task = new AsyncTask(
  'Check Vaccine Center Availability',
  checkAvailability,
  (err) => {
    console.error(err.response.statusText);
  }
);

// getBeneficiaries();
// getCenters();

const job = new SimpleIntervalJob({ seconds: 5 }, task);
scheduler.addSimpleIntervalJob(job);
