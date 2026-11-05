package model

import (
	"strings"
	"github.com/perses/shared/cue/common"
)

kind: "PulzrMapPanel"
spec: close({
	styleUrl?:       =~"^https?://"
	latitudeLabel?:  strings.MinRunes(1)
	longitudeLabel?: strings.MinRunes(1)
	format?:         common.#format
	thresholds?:     common.#thresholds
	radius?:         number & >0 & <=40
})
