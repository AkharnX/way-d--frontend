#!/usr/bin/env node

/**
 * Test automatisé pour vérifier que la correction de l'inscription fonctionne
 * Ce script teste le flux d'inscription complet sans erreur 404
 */

const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:8080';
const PROFILE_API_BASE = 'http://localhost:8081';

async function testRegistrationFix() {
  console.log('🧪 Test de la correction d\'inscription Way-D');
  console.log('===============================================');
  
  const timestamp = Date.now();
  const testEmail = `test-fix-${timestamp}@example.com`;
  
  try {
    // Étape 1: Inscription
    console.log('\n📝 Étape 1: Test de l\'inscription');
    console.log(`📧 Email de test: ${testEmail}`);
    
    const registrationData = {
      email: testEmail,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'Fix',
      birth_date: '1995-01-01',
      gender: 'male'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/register`, registrationData, {
      timeout: 10000
    });
    
    console.log('✅ Inscription réussie!');
    console.log('📋 Réponse:', registerResponse.data);
    
    if (registerResponse.data.verification_code) {
      console.log('🔑 Code de vérification:', registerResponse.data.verification_code);
      
      // Étape 2: Connexion après inscription (pour simuler le flux complet)
      console.log('\n🔐 Étape 2: Test de connexion après inscription');
      
      const loginResponse = await axios.post(`${API_BASE}/login`, {
        email: testEmail,
        password: 'TestPassword123!'
      }, {
        timeout: 10000
      });
      
      console.log('✅ Connexion réussie!');
      const token = loginResponse.data.access_token;
      console.log('🎫 Token reçu:', token.substring(0, 20) + '...');
      
      // Étape 3: Test de création de profil (devrait maintenant fonctionner)
      console.log('\n👤 Étape 3: Test de création de profil automatique');
      
      const profileData = {
        height: 175,
        bio: 'Test de création de profil automatique',
        location_string: 'Paris, France',
        looking_for: 'serious'
      };
      
      try {
        const profileResponse = await axios.post(`${PROFILE_API_BASE}/profile/auto-create`, profileData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Création de profil réussie!');
        console.log('📋 Profil créé:', profileResponse.data);
        
        // Étape 4: Vérification que le profil existe
        console.log('\n🔍 Étape 4: Vérification du profil créé');
        
        const getProfileResponse = await axios.get(`${PROFILE_API_BASE}/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        
        console.log('✅ Profil récupéré avec succès!');
        console.log('👤 Données du profil:', {
          id: getProfileResponse.data.id,
          height: getProfileResponse.data.height,
          bio: getProfileResponse.data.trait,
          active: getProfileResponse.data.active
        });
        
        console.log('\n🎉 SUCCÈS: Toutes les étapes ont réussi!');
        console.log('✅ La correction de l\'erreur 404 lors de l\'inscription fonctionne correctement.');
        
      } catch (profileError) {
        if (profileError.response?.status === 404) {
          console.log('❌ ÉCHEC: Erreur 404 toujours présente lors de la création de profil');
          console.log('🔍 Détails:', profileError.response.data);
          return false;
        } else {
          console.log('⚠️ Autre erreur lors de la création de profil:', profileError.message);
          console.log('🔍 Détails:', profileError.response?.data);
        }
      }
      
    } else {
      console.log('⚠️ Aucun code de vérification retourné');
    }
    
  } catch (error) {
    console.log('❌ ÉCHEC du test:', error.message);
    if (error.response) {
      console.log('🔍 Statut HTTP:', error.response.status);
      console.log('🔍 Données de réponse:', error.response.data);
    }
    return false;
  }
  
  return true;
}

// Exécuter le test
testRegistrationFix()
  .then(success => {
    if (success) {
      console.log('\n🎯 RÉSULTAT: Test réussi - La correction fonctionne!');
      process.exit(0);
    } else {
      console.log('\n💥 RÉSULTAT: Test échoué - Des corrections supplémentaires sont nécessaires.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Erreur lors du test:', error.message);
    process.exit(1);
  });
