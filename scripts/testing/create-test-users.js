#!/usr/bin/env node

const axios = require('axios');

/**
 * Script de création d'utilisateurs test pour Way-d E2E testing
 * Ce script crée deux utilisateurs test et configure leurs profils pour tester le système de découverte
 */

async function createTestUser() {
  try {
    console.log('🧪 WAY-D E2E TEST USER CREATION');
    console.log('==============================');
    
    // 1. Créer un utilisateur test principal
    console.log('🔐 Création du premier utilisateur test...');
    const registerResponse = await axios.post('http://157.180.36.122/api/auth/register', {
      email: 'test@way-d.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('✅ Premier utilisateur créé avec succès');
    
    // 2. Connecter l'utilisateur
    console.log('🔑 Connexion du premier utilisateur test...');
    const loginResponse = await axios.post('http://157.180.36.122/api/auth/login', {
      email: 'test@way-d.com',
      password: 'TestPassword123!'
    });
    
    const token = loginResponse.data.token;
    console.log('🎫 Token obtenu avec succès');
    
    // 3. Créer un profil pour l'utilisateur
    console.log('👤 Création du premier profil...');
    const profileResponse = await axios.post(
      'http://157.180.36.122/api/profile', 
      {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1995-01-15',
        gender: 'homme',
        lookingFor: 'femme',
        occupation: 'Développeur',
        education: 'Université',
        bio: 'Profil de test pour e2e testing',
        interests: ['sports', 'technologie', 'voyages'],
        location: {
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          coordinates: {
            latitude: 5.359952,
            longitude: -4.008256
          }
        },
        photos: [
          'https://randomuser.me/api/portraits/men/1.jpg'
        ],
        height: 180,
        religion: 'non-précisé',
        drinking: 'parfois',
        smoking: 'non',
        children: 'non',
        relationshipType: 'sérieux'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Premier profil créé avec succès:', profileResponse.data.id);
    
    // 4. Création d'un second utilisateur pour les tests de découverte
    console.log('\n👥 Création du second utilisateur test...');
    await axios.post('http://157.180.36.122/api/auth/register', {
      email: 'test2@way-d.com',
      password: 'TestPassword123!',
      firstName: 'Test2',
      lastName: 'User2'
    });
    
    const login2Response = await axios.post('http://157.180.36.122/api/auth/login', {
      email: 'test2@way-d.com',
      password: 'TestPassword123!'
    });
    
    const token2 = login2Response.data.token;
    console.log('🎫 Second token obtenu avec succès');
    
    // 5. Création du second profil
    const profile2Response = await axios.post(
      'http://157.180.36.122/api/profile', 
      {
        firstName: 'Sarah',
        lastName: 'Kouassi',
        dateOfBirth: '1997-05-23',
        gender: 'femme',
        lookingFor: 'homme',
        occupation: 'Designer',
        education: 'Université',
        bio: 'Profil de test pour discovery',
        interests: ['art', 'musique', 'mode'],
        location: {
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          coordinates: {
            latitude: 5.359952,
            longitude: -4.008256
          }
        },
        photos: [
          'https://randomuser.me/api/portraits/women/2.jpg'
        ],
        height: 165,
        religion: 'non-précisé',
        drinking: 'non',
        smoking: 'non',
        children: 'non',
        relationshipType: 'sérieux'
      },
      {
        headers: { Authorization: `Bearer ${token2}` }
      }
    );
    
    console.log('✅ Second profil créé avec succès:', profile2Response.data.id);
    
    // 6. Récapitulatif pour les tests
    console.log('\n🔐 Identifiants pour tests E2E:');
    console.log('Utilisateur 1: test@way-d.com / TestPassword123!');
    console.log('Utilisateur 2: test2@way-d.com / TestPassword123!');
    console.log(`Token 1: ${token}`);
    console.log(`Token 2: ${token2}`);
    
    // 7. Test de l'endpoint discover
    console.log('\n🔍 Test de l\'endpoint discover...');
    try {
      const discoverResponse = await axios.get(
        'http://157.180.36.122/api/profile/discover',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Résultat discover:', discoverResponse.data);
    } catch (discoverError) {
      console.error('❌ Erreur discover:', discoverError.response?.data || discoverError.message);
    }
    
    return { token, token2 };
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
}

createTestUser();
