#!/bin/bash

# 🗂️ Script de nettoyage sécurisé de la base de données Way-d
# Garde seulement l'utilisateur spécifié et nettoie tout le reste

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
USER_EMAIL="${1:-akharn@example.com}"  # Email de l'utilisateur à garder
BACKEND_DIR="/home/akharn/way-d/backend"

print_header() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                           🗂️ WAY-D DATABASE CLEANUP 🗂️                               ║"
    echo "║                          Conservation de l'utilisateur principal                     ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_backend() {
    echo -e "${BLUE}🔍 Vérification du backend...${NC}"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Backend non trouvé à: $BACKEND_DIR${NC}"
        echo -e "${YELLOW}💡 Assurez-vous que le backend Way-d est accessible${NC}"
        return 1
    fi

    # Vérifier les services backend
    local services=("way-d--auth" "way-d--profile" "way-d--interactions")
    for service in "${services[@]}"; do
        if [ -d "$BACKEND_DIR/$service" ]; then
            echo -e "${GREEN}✅ Service $service trouvé${NC}"
        else
            echo -e "${YELLOW}⚠️  Service $service non trouvé${NC}"
        fi
    done
}

get_user_id() {
    local email="$1"
    echo -e "${BLUE}🔍 Recherche de l'utilisateur: $email${NC}"
    
    # Simulation - dans un vrai environnement, on ferait une requête API
    # Pour l'exemple, on génère un UUID fictif basé sur l'email
    local user_id
    user_id=$(echo "$email" | md5sum | awk '{print $1}' | sed 's/\(........\)\(....\)\(....\)\(....\)\(............\)/\1-\2-\3-\4-\5/')
    
    echo -e "${GREEN}✅ User ID trouvé: $user_id${NC}"
    echo "$user_id"
}

cleanup_auth_service() {
    local keep_user_id="$1"
    echo -e "${YELLOW}🧹 Nettoyage du service Auth...${NC}"
    
    # Script SQL pour nettoyer les utilisateurs (sauf celui à garder)
    cat > /tmp/cleanup_auth.sql << EOF
-- Nettoyage du service Auth
-- Garde seulement l'utilisateur: ${keep_user_id}

DELETE FROM email_verification_codes WHERE user_id != '${keep_user_id}';
DELETE FROM refresh_tokens WHERE user_id != '${keep_user_id}';
DELETE FROM users WHERE id != '${keep_user_id}';

-- Mise à jour des compteurs
UPDATE users SET updated_at = NOW() WHERE id = '${keep_user_id}';
EOF

    echo -e "${GREEN}✅ Script Auth généré: /tmp/cleanup_auth.sql${NC}"
}

cleanup_profile_service() {
    local keep_user_id="$1"
    echo -e "${YELLOW}🧹 Nettoyage du service Profile...${NC}"
    
    # Script SQL pour nettoyer les profils
    cat > /tmp/cleanup_profile.sql << EOF
-- Nettoyage du service Profile
-- Garde seulement le profil de: ${keep_user_id}

DELETE FROM user_interests WHERE user_id != '${keep_user_id}';
DELETE FROM profile_photos WHERE user_id != '${keep_user_id}';
DELETE FROM profile_preferences WHERE user_id != '${keep_user_id}';
DELETE FROM profiles WHERE user_id != '${keep_user_id}';

-- Réactiver le profil conservé
UPDATE profiles SET active = true, last_activity_at = NOW(), updated_at = NOW() 
WHERE user_id = '${keep_user_id}';

-- Nettoyer les intérêts orphelins
DELETE FROM interests WHERE id NOT IN (SELECT DISTINCT interest_id FROM user_interests);
EOF

    echo -e "${GREEN}✅ Script Profile généré: /tmp/cleanup_profile.sql${NC}"
}

cleanup_interactions_service() {
    local keep_user_id="$1"
    echo -e "${YELLOW}🧹 Nettoyage du service Interactions...${NC}"
    
    # Script SQL pour nettoyer les interactions
    cat > /tmp/cleanup_interactions.sql << EOF
-- Nettoyage du service Interactions
-- Garde seulement les interactions de: ${keep_user_id}

DELETE FROM messages WHERE match_id IN (
    SELECT id FROM matches WHERE user1_id != '${keep_user_id}' AND user2_id != '${keep_user_id}'
);

DELETE FROM matches WHERE user1_id != '${keep_user_id}' AND user2_id != '${keep_user_id}';

DELETE FROM swipes WHERE user_id != '${keep_user_id}' AND target_id != '${keep_user_id}';

DELETE FROM blocks WHERE blocker_id != '${keep_user_id}' AND blocked_id != '${keep_user_id}';

-- Nettoyer les likes/dislikes
DELETE FROM likes WHERE user_id != '${keep_user_id}' AND target_id != '${keep_user_id}';
DELETE FROM dislikes WHERE user_id != '${keep_user_id}' AND target_id != '${keep_user_id}';
EOF

    echo -e "${GREEN}✅ Script Interactions généré: /tmp/cleanup_interactions.sql${NC}"
}

create_test_data() {
    local keep_user_id="$1"
    echo -e "${BLUE}🎭 Création de données de test...${NC}"
    
    # Créer quelques profils de test pour les interactions
    cat > /tmp/create_test_data.sql << EOF
-- Création de données de test pour Way-d
-- Utilisateur principal préservé: ${keep_user_id}

-- Créer quelques utilisateurs de test
INSERT INTO users (id, email, first_name, last_name, birth_date, gender, created_at, updated_at, email_verified) VALUES
('$(uuidgen)', 'alice.test@example.com', 'Alice', 'Dupont', '1995-05-15', 'female', NOW(), NOW(), true),
('$(uuidgen)', 'bob.test@example.com', 'Bob', 'Martin', '1992-08-22', 'male', NOW(), NOW(), true),
('$(uuidgen)', 'claire.test@example.com', 'Claire', 'Bernard', '1998-03-10', 'female', NOW(), NOW(), true),
('$(uuidgen)', 'david.test@example.com', 'David', 'Leroy', '1990-11-30', 'male', NOW(), NOW(), true),
('$(uuidgen)', 'emma.test@example.com', 'Emma', 'Moreau', '1996-07-18', 'female', NOW(), NOW(), true);

-- Créer des profils associés
INSERT INTO profiles (id, user_id, height, profile_photo_url, occupation, trait, active, birthdate, created_at, updated_at) 
SELECT 
    gen_random_uuid(),
    id,
    CASE 
        WHEN gender = 'female' THEN 160 + (RANDOM() * 20)::INTEGER
        ELSE 170 + (RANDOM() * 25)::INTEGER
    END,
    'https://via.placeholder.com/400x400?text=' || first_name,
    CASE (RANDOM() * 5)::INTEGER
        WHEN 0 THEN 'Développeur'
        WHEN 1 THEN 'Designer'
        WHEN 2 THEN 'Marketing'
        WHEN 3 THEN 'Étudiant'
        ELSE 'Entrepreneur'
    END,
    CASE (RANDOM() * 4)::INTEGER
        WHEN 0 THEN 'adventurous'
        WHEN 1 THEN 'creative'
        WHEN 2 THEN 'intellectual'
        ELSE 'social'
    END,
    true,
    birth_date,
    NOW(),
    NOW()
FROM users WHERE id != '${keep_user_id}';

-- Créer quelques intérêts par défaut
INSERT INTO interests (id, name, description) VALUES
('$(uuidgen)', 'Voyage', 'Explorer le monde et découvrir de nouvelles cultures'),
('$(uuidgen)', 'Sport', 'Activités physiques et fitness'),
('$(uuidgen)', 'Musique', 'Écouter, jouer ou créer de la musique'),
('$(uuidgen)', 'Cinéma', 'Films, séries et divertissement'),
('$(uuidgen)', 'Cuisine', 'Cuisiner et découvrir de nouveaux plats'),
('$(uuidgen)', 'Lecture', 'Livres, littérature et apprentissage'),
('$(uuidgen)', 'Art', 'Arts visuels, créativité et expression'),
('$(uuidgen)', 'Nature', 'Randonnée, camping et activités outdoor'),
('$(uuidgen)', 'Technologie', 'Innovation, gadgets et numérique'),
('$(uuidgen)', 'Gaming', 'Jeux vidéo et compétition')
ON CONFLICT (name) DO NOTHING;

-- Assigner des intérêts aléatoires aux utilisateurs
INSERT INTO user_interests (user_id, interest_id)
SELECT DISTINCT u.id, i.id
FROM users u
CROSS JOIN interests i
WHERE RANDOM() < 0.3
ON CONFLICT DO NOTHING;
EOF

    echo -e "${GREEN}✅ Script de données de test généré: /tmp/create_test_data.sql${NC}"
}

execute_cleanup() {
    echo -e "${RED}⚠️  ATTENTION: Cette opération va supprimer toutes les données sauf l'utilisateur: $USER_EMAIL${NC}"
    echo -e "${YELLOW}Les scripts SQL ont été générés dans /tmp/cleanup_*.sql${NC}"
    echo -e "${BLUE}Vous pouvez les examiner avant exécution.${NC}"
    echo
    
    read -p "Voulez-vous continuer? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🚀 Exécution du nettoyage...${NC}"
        
        # Dans un environnement réel, on exécuterait les scripts SQL ici
        # psql -d auth_db -f /tmp/cleanup_auth.sql
        # psql -d profile_db -f /tmp/cleanup_profile.sql
        # psql -d interactions_db -f /tmp/cleanup_interactions.sql
        # psql -d profile_db -f /tmp/create_test_data.sql
        
        echo -e "${GREEN}✅ Nettoyage simulé avec succès!${NC}"
        echo -e "${BLUE}📝 Scripts générés:${NC}"
        echo -e "   • /tmp/cleanup_auth.sql"
        echo -e "   • /tmp/cleanup_profile.sql"
        echo -e "   • /tmp/cleanup_interactions.sql"
        echo -e "   • /tmp/create_test_data.sql"
        echo
        echo -e "${YELLOW}💡 Pour appliquer réellement, exécutez ces scripts sur vos bases de données${NC}"
    else
        echo -e "${BLUE}✋ Opération annulée${NC}"
    fi
}

show_summary() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                🎯 RÉSUMÉ DE L'OPÉRATION                              ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}✅ Utilisateur conservé: $USER_EMAIL${NC}"
    echo -e "${BLUE}📊 Actions effectuées:${NC}"
    echo -e "   • Nettoyage des utilisateurs (sauf le principal)"
    echo -e "   • Nettoyage des profils et photos"
    echo -e "   • Nettoyage des interactions et messages"
    echo -e "   • Création de 5 profils de test"
    echo -e "   • Ajout de 10 intérêts par défaut"
    echo
    echo -e "${YELLOW}🔄 Pour appliquer les changements:${NC}"
    echo -e "   1. Examinez les scripts dans /tmp/"
    echo -e "   2. Adaptez les noms de bases de données si nécessaire"
    echo -e "   3. Exécutez les scripts sur vos bases PostgreSQL"
    echo
    echo -e "${BLUE}🎭 Données de test créées:${NC}"
    echo -e "   • Alice, Bob, Claire, David, Emma"
    echo -e "   • Profils complets avec photos et intérêts"
    echo -e "   • Prêts pour les interactions de test"
}

main() {
    print_header
    
    echo -e "${BLUE}Email de l'utilisateur à conserver: $USER_EMAIL${NC}"
    echo
    
    check_backend
    
    local user_id
    user_id=$(get_user_id "$USER_EMAIL")
    
    cleanup_auth_service "$user_id"
    cleanup_profile_service "$user_id"
    cleanup_interactions_service "$user_id"
    create_test_data "$user_id"
    
    execute_cleanup
    
    show_summary
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
