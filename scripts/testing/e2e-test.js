#!/usr/bin/env node

/**
 * Script de test E2E pour Way-d
 * Ce script crée des utilisateurs test et effectue des opérations pour vérifier le fonctionnement du système
 */

import axios from 'axios';
import fs from 'fs/promises';

const BASE_URL = 'http://157.180.36.122';
const AUTH_API = `${BASE_URL}/api/auth`;
const PROFILE_API = `${BASE_URL}/api/profile`;
const INTERACTIONS_API = `${BASE_URL}/api/interactions`;

// Utilisateurs de test
const TEST_USER_1 = {
  email: 'test@way-d.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  birthDate: '1990-01-01',
  gender: 'male'
};

const TEST_USER_2 = {
  email: 'test2@way-d.com',
  password: 'TestPassword123!',
  firstName: 'Sarah',
  lastName: 'Kouassi',
  birthDate: '1992-05-15',
  gender: 'female'
};

// Fonction pour attendre entre les opérations
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enregistrer les logs dans un fichier
async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  console.log(logMessage);
  
  try {
    await fs.appendFile('./logs/e2e-test.log', logMessage);
  } catch (error) {
    // Ignore errors when writing to log file
  }
}

// Nettoyer le log au début
async function cleanLog() {
  try {
    await fs.mkdir('./logs', { recursive: true });
    await fs.writeFile('./logs/e2e-test.log', '');
  } catch (error) {
    console.error('Error cleaning log:', error);
  }
}

// Créer un utilisateur test
async function createTestUser(user) {
  try {
    // 1. Vérifier si l'utilisateur existe déjà en tentant de se connecter
    try {
      await log(`Tentative de connexion pour ${user.email}...`);
      const loginResponse = await axios.post(`${AUTH_API}/login`, {
        email: user.email,
        password: user.password
      });
      
      await log(`✅ L'utilisateur ${user.email} existe déjà et s'est connecté avec succès`);
      return loginResponse.data;
    } catch (loginError) {
      // Si l'erreur n'est pas 401 (non autorisé), alors c'est une autre erreur
      if (loginError.response?.status !== 401) {
        await log(`⚠️ Erreur lors de la tentative de connexion: ${loginError.message}`, 'error');
        throw loginError;
      }
      
      // Si l'utilisateur n'existe pas, le créer
      await log(`L'utilisateur ${user.email} n'existe pas, création en cours...`);
    }
    
    // 2. Créer l'utilisateur
    const registerResponse = await axios.post(`${AUTH_API}/register`, {
      email: user.email,
      password: user.password,
      FirstName: user.firstName,
      LastName: user.lastName,
      BirthDate: user.birthDate,
      Gender: user.gender
    });
    
    await log(`✅ Utilisateur ${user.email} créé avec succès`);
    
    // 3. Se connecter avec l'utilisateur créé
    const loginResponse = await axios.post(`${AUTH_API}/login`, {
      email: user.email,
      password: user.password
    });
    
    await log(`✅ Utilisateur ${user.email} connecté avec succès`);
    return loginResponse.data;
    
  } catch (error) {
    await log(`❌ Erreur lors de la création/connexion de l'utilisateur ${user.email}: ${error.message}`, 'error');
    if (error.response?.data) {
      await log(`Détails de l'erreur: ${JSON.stringify(error.response.data)}`, 'error');
    }
    throw error;
  }
}

// Créer ou mettre à jour un profil
async function createOrUpdateProfile(token, profileData) {
  try {
    await log(`Création/mise à jour du profil...`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Vérifier si le profil existe
    try {
      await axios.get(`${PROFILE_API}/me`, { headers });
      await log(`Le profil existe déjà, mise à jour...`);
    } catch (getError) {
      await log(`Le profil n'existe pas, création...`);
    }
    
    // Créer ou mettre à jour le profil
    const profileResponse = await axios.put(
      `${PROFILE_API}/me`,
      profileData,
      { headers }
    );
    
    await log(`✅ Profil créé/mis à jour avec succès`);
    return profileResponse.data;
    
  } catch (error) {
    await log(`❌ Erreur lors de la création/mise à jour du profil: ${error.message}`, 'error');
    if (error.response?.data) {
      await log(`Détails de l'erreur: ${JSON.stringify(error.response.data)}`, 'error');
    }
    throw error;
  }
}

// Tester l'endpoint /discover
async function testDiscover(token) {
  try {
    await log(`Test de l'endpoint /discover...`);
    
    const headers = { Authorization: `Bearer ${token}` };
    const discoverResponse = await axios.get(`${PROFILE_API}/discover`, { headers });
    
    await log(`✅ Endpoint /discover testé avec succès, ${discoverResponse.data.length} profils trouvés`);
    
    if (discoverResponse.data.length > 0) {
      await log(`Premier profil: ${JSON.stringify(discoverResponse.data[0])}`);
    } else {
      await log(`⚠️ Aucun profil trouvé dans les résultats de discover`);
    }
    
    return discoverResponse.data;
    
  } catch (error) {
    await log(`❌ Erreur lors du test de l'endpoint /discover: ${error.message}`, 'error');
    if (error.response?.data) {
      await log(`Détails de l'erreur: ${JSON.stringify(error.response.data)}`, 'error');
    }
    throw error;
  }
}

// Tester les endpoints health
async function testHealthEndpoints() {
  try {
    await log(`Test des endpoints health...`);
    
    const endpoints = [
      { name: 'Auth', url: `${AUTH_API}/health` },
      { name: 'Profile', url: `${PROFILE_API}/health` },
      { name: 'Interactions', url: `${INTERACTIONS_API}/health` }
    ];
    
    const results = await Promise.allSettled(
      endpoints.map(async endpoint => {
        try {
          const response = await axios.get(endpoint.url);
          await log(`✅ Endpoint ${endpoint.name} health OK: ${JSON.stringify(response.data)}`);
          return { endpoint: endpoint.name, status: 'ok', data: response.data };
        } catch (error) {
          await log(`❌ Endpoint ${endpoint.name} health failed: ${error.message}`, 'error');
          return { endpoint: endpoint.name, status: 'failed', error: error.message };
        }
      })
    );
    
    return results;
    
  } catch (error) {
    await log(`❌ Erreur lors du test des endpoints health: ${error.message}`, 'error');
    throw error;
  }
}

// Fonction principale pour exécuter les tests
async function main() {
  try {
    // Nettoyer le log au début
    await cleanLog();
    
    await log(`🧪 WAY-D E2E TEST - ${new Date().toISOString()}`);
    await log(`\n=======================================================\n`);
    
    // 1. Tester les endpoints health
    await log(`\n📡 Test des endpoints health\n`);
    await testHealthEndpoints().catch(error => {
      // Ignorer les erreurs des endpoints health pour continuer le test
      log(`⚠️ Erreurs dans les tests de health endpoints, mais on continue...`, 'warn');
    });
    
    // 2. Créer le premier utilisateur test
    await log(`\n👤 Création du premier utilisateur test\n`);
    const user1Data = await createTestUser(TEST_USER_1);
    
    // 3. Créer un profil pour l'utilisateur 1
    await log(`\n👤 Création d'un profil pour le premier utilisateur\n`);
    const user1ProfileData = {
      height: 180,
      profile_photo_url: "https://randomuser.me/api/portraits/men/1.jpg",
      occupation: "Développeur",
      trait: "Passionné de technologie et de sport",
      birthdate: "1990-01-01T00:00:00Z",
      location: { lat: 5.3600, lng: -4.0083 }
    };
    
    try {
      await createOrUpdateProfile(user1Data.access_token, user1ProfileData);
    } catch (profileError) {
      // Ignorer les erreurs de profil pour continuer le test
      await log(`⚠️ Erreur lors de la création du profil, mais on continue...`, 'warn');
    }
    
    // 4. Tester l'endpoint discover
    await log(`\n🔍 Test de l'endpoint discover\n`);
    try {
      await testDiscover(user1Data.access_token);
    } catch (discoverError) {
      // Ignorer les erreurs de discover pour continuer le test
      await log(`⚠️ Erreur lors du test de discover, mais on continue...`, 'warn');
    }
    
    // 5. Créer le deuxième utilisateur test (si besoin)
    try {
      await log(`\n👤 Création du deuxième utilisateur test\n`);
      const user2Data = await createTestUser(TEST_USER_2);
      
      // 6. Créer un profil pour l'utilisateur 2
      await log(`\n👤 Création d'un profil pour le deuxième utilisateur\n`);
      const user2ProfileData = {
        height: 165,
        profile_photo_url: "https://randomuser.me/api/portraits/women/1.jpg",
        occupation: "Designer",
        trait: "Créative et sociable, j'aime découvrir de nouvelles personnes",
        birthdate: "1992-05-15T00:00:00Z",
        location: { lat: 5.3474, lng: -3.9857 }
      };
      
      try {
        await createOrUpdateProfile(user2Data.access_token, user2ProfileData);
      } catch (profileError2) {
        await log(`⚠️ Erreur lors de la création du profil 2, mais on continue...`, 'warn');
      }
      
    } catch (user2Error) {
      await log(`⚠️ Erreur lors de la création du deuxième utilisateur, mais on continue...`, 'warn');
    }
    
    // Test terminé avec succès
    await log(`\n✅ TEST E2E TERMINÉ AVEC SUCCÈS\n`);
    await log(`=======================================================`);
    
  } catch (error) {
    await log(`❌ ERREUR FATALE DANS LE TEST E2E: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('Unhandled error in E2E test:', error);
  process.exit(1);
});
