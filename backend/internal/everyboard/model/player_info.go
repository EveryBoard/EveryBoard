package model

type PlayerInfo struct {
	User MinimalUser `gorm:"embedded" json:"user"`
	Elo  float64     `json:"elo"`
}

func (p *PlayerInfo) MinimalUserOrNil() *MinimalUser {
	if p == nil {
		return nil
	}
	return &p.User
}
