import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import logo from 'assets/img/capa.jpeg';
import { Paper, TextField, Grid, Button } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    padding: '0 60px'
  },
  title: {
    textAlign: 'center'
  },
  image: {
    maxWidth: '100%',
    height: 'auto'
  },
  paper: {
    padding: 16
  },
  button: {
    height: 50
  }
});

export default memo(() => {
  const classes = useStyles({});

  return (
    <div className={classes.container}>
      <Grid container justify='center' alignItems='center'>
        <Grid item sm={12} md={6}>
          <img src={logo} alt='logo' className={classes.image} />
        </Grid>
        <Grid item sm={12} md={6}>
          <Paper className={classes.paper}>
            <h1 className={classes.title}>Preencha o formulário e ganhe um e-book grátis</h1>
            <form>
              <TextField id='nome' label='Nome' variant='outlined' fullWidth margin='normal' />
              <TextField id='email' label='E-mail' type='email' variant='outlined' fullWidth margin='normal' />
              <TextField id='telefone' label='Telefone' variant='outlined' fullWidth margin='normal' />

              <Button variant='contained' color='primary' fullWidth className={classes.button}>
                Download Grátis
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
});
