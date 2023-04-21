make: build
	
build: run
	
run:
	open ./index.html

deploy-nitrogen:
	rsync -vrc * tyg@theyardgames.org:/httpdocs/game/nitrogen --exclude-from rsync-exclude
deploy-water:
	rsync -vrc * tyg@theyardgames.org:/httpdocs/game/water --exclude-from rsync-exclude
deploy-carbon:
	rsync -vrc * tyg@theyardgames.org:/httpdocs/game/carbon --exclude-from rsync-exclude