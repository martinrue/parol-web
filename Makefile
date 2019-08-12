all: serve

serve:
	python -m SimpleHTTPServer 1234

.PHONY: all serve
