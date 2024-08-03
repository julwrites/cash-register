<template>
    <div class="settings">
      <h2>Settings</h2>
      <form @submit.prevent="saveSettings">
        <div class="form-group">
          <label for="language">Language:</label>
          <select id="language" v-model="selectedLanguage">
            <option value="en">English</option>
            <option value="fr">French</option>
            <!-- Add more language options as needed -->
          </select>
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import useSettings from '@/composables/useSettings';
  
  const selectedLanguage = ref('en'); // default language
  const { getSavedSettings, saveUserSettings } = useSettings();
  
  onMounted(async () => {
    const savedSettings = await getSavedSettings();
    if (savedSettings) {
      selectedLanguage.value = savedSettings.language;
    }
  });
  
  async function saveSettings() {
    await saveUserSettings({ language: selectedLanguage.value });
    // Optionally, you can display a success message or perform other actions after saving the settings
  }
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>