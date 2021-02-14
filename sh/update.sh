cd "$1"
git add "$2"
git -c user.name="$3" -c user.email="no@e.mail" commit -m "$4"
