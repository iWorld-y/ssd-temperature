package service

import (
	"log"
	"testing"
)

func TestListPhysicalDisks(t *testing.T) {
	s := TemperatureService{}
	disks, err := s.ListPhysicalDisks()
	if err != nil {
		t.Errorf("ListPhysicalDisks() error = %v", err)
		return
	}
	if len(disks) == 0 {
		t.Errorf("ListPhysicalDisks() = %v, want > 0", len(disks))
	}
	log.Printf("ListPhysicalDisks() = %v", disks)
}
