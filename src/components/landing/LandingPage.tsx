import { FC } from 'react';
import { Box, Typography, Container } from '@mui/material';
import vaPorValleLogo from '../../assets/va-por-valle-logo.svg';

const LandingPage: FC = () => {
  return (
    <Container 
      maxWidth={false} 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        py: 4
      }}
    >
      <Box
        component="img"
        src={vaPorValleLogo}
        alt="Va Por Valle Logo"
        sx={{
          width: '100%',
          maxWidth: 400,
          height: 'auto',
          mb: 4
        }}
      />
      
      <Typography 
        variant="h4" 
        component="h1" 
        align="center"
        sx={{
          fontWeight: 'bold',
          color: '#333',
          mb: 2
        }}
      >
        SISTEMA DEL CENTRO DE ACOPIO
      </Typography>
      
      <Typography 
        variant="h5" 
        component="h2" 
        align="center"
        sx={{
          color: '#666',
        }}
      >
        VA POR VALLE / BARRIO 28
      </Typography>
    </Container>
  );
};

export default LandingPage;
