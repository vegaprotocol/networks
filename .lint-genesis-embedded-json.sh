#!/usr/bin/env bash

# List of possibly-existing json paths containing json
params=(
	'.app_state.network_parameters."blockchains.ethereumConfig"'
	'.market.margin.scalingFactors'
	'.market.monitor.price.defaultParameters'
)

col_green=""
col_red=""
col_reset=""
if test -t 1 ; then
	col_green="\033[32m"
	col_red="\033[31m"
	col_reset="\033[0m"
fi

failedfile="$(mktemp -t lint-genesis-embedded-json-XXXXXXXX.txt)"
jqerrfile="$(mktemp -t lint-genesis-embedded-json-jqerr-XXXXXXXX.txt)"
cleanup() {
	rm -f "$failedfile" "$jqerrfile"
}
trap cleanup EXIT

find . -name '*genesis*.json' | sort | while read -r genesisjson
do
	for jsonpath in "${params[@]}" ; do
		if ! jq -Mr "$jsonpath" "$genesisjson" | jq . 1>/dev/null 2>"$jqerrfile"
		then
			errs="$(cat "$jqerrfile")"
			echo -e "${col_red}FAIL$col_reset\t$genesisjson\t$jsonpath\n$errs"
			echo "$genesisjson,$jsonpath" >>"$failedfile"
		else
			echo -e "${col_green}OK$col_reset\t$genesisjson\t$jsonpath"
		fi
	done
done
fail_count="$(wc -l <"$failedfile")"
if [[ "$fail_count" -gt 0 ]] ; then
	echo -e "${col_red}Tests failed: $fail_count${col_reset}"
	exit 1
fi
echo -e "${col_green}All tests passed${col_reset}"
