import 'dotenv/config';
import app from './app';
import { startLicenseExpiryCron } from './jobs/licenseExpiry.cron';
import { startWeatherAlertCron } from './jobs/weatherAlert.cron';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 TransitOps API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  startLicenseExpiryCron();
  startWeatherAlertCron();
});
