cd "$1"
touch "$2"

git init
git add "$2"
git -c user.name="$3" -c user.email="no@e.mail" commit -m "start"
