<template>
  <v-app>
    <v-app-bar color="indigo" density="comfortable" dark>
      <v-app-bar-title>TeamMeet Planner (Vue + Vuetify)</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/">Início</v-btn>
      <v-btn variant="text" to="/sobre">Sobre</v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
