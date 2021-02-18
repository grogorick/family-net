cd "$1"

prev_user=$(git log -1 --format=format:'%an')
prev_time=$(git log -1 --format=format:'%at')
prev_msg=$(git log -1 --format=format:'%s')

curr_time=$(date +"%s")

git add "$2"

if [ "$3" == "$prev_user" ] && [ "$4" == "$prev_msg" ] && [ $(($curr_time - $prev_time)) -lt $5 ]; then
	git commit --amend -m "$4" --date "$(date)"
	echo UPDATED
else
	git -c user.name="$3" -c user.email="no@e.mail" commit -m "$4"
	echo COMMITTED
fi

cd -
