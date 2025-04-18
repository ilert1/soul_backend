#!/bin/bash

# Параметры
REPO_URL="https://github.com/SoulGarage/api.git"
CLONE_DIR="./backend"
DEST_DIR="../"
FILES=("README.md" ".env.example" ".github" ".husky" ".vscode" "docker-compose.yml" ".prettierrc" "eslint.config.mjs" ".npmrc")
cd ./apps

rm -rf ./backend
# Клонирование репозитория
if git clone --branch dev "$REPO_URL" "$CLONE_DIR"; then
  echo "Repository cloned successfully"
else
  echo "Failed to clone repository"
  exit 1
fi
rm -rf "$DEST_DIR/.github" "$DEST_DIR/.husky" "$DEST_DIR/.vscode" "$DEST_DIR/prisma"
# Цикл по файлам и перемещение каждого файла
for FILE in "${FILES[@]}"; do
  mv -f "$CLONE_DIR/$FILE" "$DEST_DIR/"
done
rm -rf ./backend/.git
