import { LoginForm } from '../../../presentation/components/auth/LoginForm'
import { Grid, Box, Typography } from '@mui/material'

export default function LoginPage() {
    return (

        <Grid container sx={{
            //minHeight: '100dvh',
            backgroundImage: { xs: 'url("/judo-illustration-mobile.png")', md: 'none' },
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>

            <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{
                position: 'relative',
                display: { xs: 'none', md: 'block' },

            }}
            >

                <Box component="img"
                    sx={{
                        height: 50,
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        color: 'white'
                    }}
                    src="/logo.svg"
                    alt="Logo Asociación Departamental de Judo Cochabamba"

                    style={{ objectFit: 'contain' }}>
                </Box>

                <Box component="img"
                    sx={{
                        height: 'calc(100% - 80px)',
                        position: 'absolute',
                        top: 85,
                        left: -70,
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                    src="/judo-illustration.png"
                    alt="Judo Illustration">
                </Box>


            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                px: 4,

            }}>
                <LoginForm />
            </Grid>


        </Grid>
    )
}