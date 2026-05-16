function sendEmailSimulation(to, subject, body) {
  console.log('--- Email simulation ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(body);
  console.log('--- End email ---');
}

export { sendEmailSimulation };
