.PHONY: run build preview test check-siblings

run: check-siblings
	pnpm dev

build: check-siblings
	pnpm build

preview: check-siblings
	pnpm preview

test: check-siblings
	pnpm test

check-siblings:
	@test -d ../contracts || (echo "" && \
	  echo "  Falta ../contracts. Cloná rocket-lease/contracts al lado de web/." && \
	  echo "  Detalles: ../api/docs/adr/0007-contracts-as-source.md" && \
	  echo "" && exit 1)
