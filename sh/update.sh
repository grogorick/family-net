storage_dir="$1"
storage_file="$2"
curr_user="$3"
curr_msg_short="$4"
curr_msg="update :: $4"
curr_time=$(date +"%s")

cd "$storage_dir"

prev_user=$(git log -1 --format=format:'%an')
prev_msg=$(git log -1 --format=format:'%s')
prev_time=$(git log -1 --format=format:'%at')

curr_type=$(echo "$curr_msg_short" | cut -d ' ' -f 1)
prev_type=$(echo "$prev_msg" | cut -d ' ' -f 3)

git add $storage_file

if  [ "$curr_user" == "$prev_user" ] && ( \
      [ "$curr_msg" == "$prev_msg" ] || ( \
        [ "$curr_type" == m ] && \
        [ "$prev_type" == m ] ) ) && \
    [ $(($curr_time - $prev_time)) -lt 3600 ]
then
  if [ "$curr_msg" == "$prev_msg" ]; then
    git -c user.name="$curr_user" -c user.email="no@e.mail" commit --amend -m "$prev_msg" --date "$(date)"
    echo UPDATED $curr_user/$prev_user // $curr_msg/$prev_msg // $curr_type/$prev_type // $curr_time/$prev_time UPDATED
  else
    git -c user.name="$curr_user" -c user.email="no@e.mail" commit --amend -m "$prev_msg $curr_msg_short" --date "$(date)"
    echo EXTENDED $curr_user/$prev_user // $curr_msg/$prev_msg/$prev_msg $curr_msg_short // $curr_type/$prev_type // $curr_time/$prev_time EXTENDED
  fi
else
  git -c user.name="$curr_user" -c user.email="no@e.mail" commit -m "$curr_msg"
  echo COMMITTED $curr_user/$prev_user // $curr_msg/$prev_msg // $curr_type/$prev_type // $curr_time/$prev_time COMMITTED
fi

cd -
