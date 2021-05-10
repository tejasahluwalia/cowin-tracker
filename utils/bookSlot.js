import token from './token.js';

let preferredDate = '';
let preferredCenter = '';
let beneficiaries = [''];
let doseNumber = 1;

let isBooked = false;

export default async function bookSlot(availableCenters) {
  if (!isBooked) {
    availableCenters.map((center) => {
      if (center.name == preferredCenter && center.date == preferredDate) {
        axios
          .post(
            'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
            {
              center_id: center.id,
              session_id: center.session_id,
              beneficiaries: beneficiaries,
              slot: center.slots[0],
              dose: doseNumber,
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
          });
      }
    });
    return;
  }
  return;
}
