import axios from 'axios';
import token from './token.js';
import bookSlot from './bookSlot.js';

let url =
  'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=571&date=10-05-2021';

export default async function checkAvailability() {
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
            session.min_age_limit == 18 &&
            session.vaccine == 'COVISHIELD' &&
            session.available_capacity > 0
          ) {
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
      console.log(new Date().toLocaleTimeString('en-IN'));
      if (availableCenters.length > 0) {
        console.log(availableCenters);
        bookSlot(availableCenters);
      } else {
        console.log('No slots available yet.\n');
      }
    });
}
