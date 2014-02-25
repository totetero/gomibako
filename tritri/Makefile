JSX = jsx

all: test02 test03

test02:
	cd src02 ; cat Main.jsx Ctrl.jsx Character.jsx Field.jsx Place.jsx Battle.jsx > ../test02.jsx
	$(JSX) --output test02.js test02.jsx

test03:
	cd src03 ; cat Main.jsx > ../test03.jsx
	$(JSX) --output test03.js src03/Main.jsx

