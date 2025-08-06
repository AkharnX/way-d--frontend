// Test du système de cache de découverte
// Ce script peut être exécuté dans la console du navigateur

console.log('🧪 Test du système de cache DiscoveryCache...');

// Test 1: Ajouter des profils au cache
try {
  console.log('📝 Test 1: Ajout de profils au cache');
  DiscoveryCache.addExcludedProfileIds(['profile-test-1', 'profile-test-2', 'profile-test-3']);
  
  const stats = DiscoveryCache.getCacheStats();
  console.log('✅ Cache stats après ajout:', stats);
  
  if (stats.size >= 3) {
    console.log('✅ Test 1 RÉUSSI: Profils ajoutés correctement');
  } else {
    console.log('❌ Test 1 ÉCHOUÉ: Profils non ajoutés');
  }
} catch (error) {
  console.log('❌ Test 1 ERREUR:', error);
}

// Test 2: Récupérer les profils exclus
try {
  console.log('📝 Test 2: Récupération des profils exclus');
  const excluded = DiscoveryCache.getExcludedProfileIds();
  
  if (excluded.has('profile-test-1') && excluded.has('profile-test-2')) {
    console.log('✅ Test 2 RÉUSSI: Profils récupérés correctement');
    console.log(`✅ Cache contient ${excluded.size} profils exclus`);
  } else {
    console.log('❌ Test 2 ÉCHOUÉ: Profils non trouvés dans le cache');
  }
} catch (error) {
  console.log('❌ Test 2 ERREUR:', error);
}

// Test 3: Test de performance
try {
  console.log('📝 Test 3: Performance du cache');
  const startTime = performance.now();
  
  // Ajouter 100 profils pour tester la performance
  const testIds = Array.from({length: 100}, (_, i) => `perf-test-${i}`);
  DiscoveryCache.addExcludedProfileIds(testIds);
  
  const excluded = DiscoveryCache.getExcludedProfileIds();
  
  // Tester 1000 recherches
  for (let i = 0; i < 1000; i++) {
    excluded.has(`perf-test-${i % 100}`);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Test 3 RÉUSSI: 1000 recherches en ${duration.toFixed(2)}ms`);
  
  if (duration < 50) {
    console.log('✅ Performance EXCELLENTE (< 50ms)');
  } else if (duration < 100) {
    console.log('✅ Performance BONNE (< 100ms)');
  } else {
    console.log('⚠️ Performance ACCEPTABLE (< 200ms)');
  }
  
} catch (error) {
  console.log('❌ Test 3 ERREUR:', error);
}

// Test 4: Nettoyage
try {
  console.log('📝 Test 4: Nettoyage du cache');
  DiscoveryCache.clearCache();
  
  const stats = DiscoveryCache.getCacheStats();
  
  if (stats.size === 0) {
    console.log('✅ Test 4 RÉUSSI: Cache nettoyé correctement');
  } else {
    console.log('❌ Test 4 ÉCHOUÉ: Cache non nettoyé');
  }
} catch (error) {
  console.log('❌ Test 4 ERREUR:', error);
}

console.log('🎯 Tests terminés !');
console.log('Pour tester en conditions réelles:');
console.log('1. Allez sur la page Discovery');
console.log('2. Likez ou dislikez quelques profils');
console.log('3. Rechargez la page');
console.log('4. Vérifiez que ces profils n\'apparaissent plus');
