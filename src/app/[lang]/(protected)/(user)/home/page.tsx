import Typography from '@mui/material/Typography'

export default function UserHomePage() {
  return (
    <div className='p-6'>
      <Typography variant='h4'>User Home</Typography>
      <Typography color='text.secondary'>Accessible to authenticated users</Typography>
    </div>
  )
}
