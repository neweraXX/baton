```json
{
  "S01": {
    "now": "14:10",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1102", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1101"],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S02": {
    "now": "14:20",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1103", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["CS-1107-001"],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S03": {
    "now": "14:25",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "CS-1107-002", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1104"],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S04": {
    "now": "14:30",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1106", "version": 1, "expectCode": "claimed" },
      { "op": "block", "version": 2, "expectEvents": [] }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1105 v1",
        "expect": { "kind": "claim", "code": "old_version" }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1105 v2",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S05": {
    "now": "14:35",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "CS-1107-003", "version": 1, "expectCode": "claimed" },
      { "op": "block", "version": 2, "expectEvents": [] },
      { "op": "block", "version": 3, "expectEvents": [] }
    ],
    "steps": [
      {
        "sender": "Minh",
        "command": "@ledger nhận SR-1107 v1",
        "expect": { "kind": "claim", "code": "old_version" }
      },
      {
        "sender": "Minh",
        "command": "@ledger nhận SR-1107 v3",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S06": {
    "now": "14:40",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1109", "version": 1, "expectCode": "claimed" },
      { "op": "block", "version": 2, "expectEvents": [] }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1108 v1",
        "expect": { "kind": "claim", "code": "old_version" }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1108 v2",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S07": {
    "now": "14:40",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1110", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Minh", "caseId": "SR-1111", "version": 1, "expectCode": "claimed" },
      {
        "op": "block",
        "version": 2,
        "expectEvents": [
          { "type": "stale", "caseId": "SR-1110" }
        ]
      }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1110"],
          "staleUsers": { "SR-1110": "Dung" },
          "urgent": []
        }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1110 v2",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S08": {
    "now": "14:50",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1112", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Dung", "caseId": "SR-1113", "version": 1, "expectCode": "claimed" },
      {
        "op": "block",
        "version": 2,
        "expectEvents": [
          { "type": "stale", "caseId": "SR-1112" }
        ]
      }
    ],
    "steps": [
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1112"],
          "staleUsers": { "SR-1112": "Minh" },
          "urgent": []
        }
      },
      {
        "sender": "Minh",
        "command": "@ledger nhận SR-1112 v2",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S09": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1114", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Minh", "caseId": "CS-1107-004", "version": 1, "expectCode": "claimed" },
      {
        "op": "block",
        "version": 2,
        "expectEvents": [
          { "type": "stale", "caseId": "SR-1114" }
        ]
      },
      { "op": "claim", "user": "Dung", "caseId": "SR-1114", "version": 2, "expectCode": "claimed" },
      {
        "op": "block",
        "version": 3,
        "expectEvents": [
          { "type": "stale", "caseId": "SR-1114" }
        ]
      }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1114"],
          "staleUsers": { "SR-1114": "Dung" },
          "urgent": []
        }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1114 v3",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S10": {
    "now": "14:55",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1116", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1115 v1",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Minh",
        "command": "@ledger nhận SR-1115 v1",
        "expect": { "kind": "claim", "code": "conflict" }
      },
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S11": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1117", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Dung", "caseId": "SR-1118", "version": 1, "expectCode": "claimed" },
      { "op": "block", "version": 2, "expectEvents": [] }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1117 v2",
        "expect": { "kind": "claim", "code": "conflict" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S12": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["SR-1119", "SR-1120"],
          "staleUsers": {},
          "urgent": ["SR-1119"]
        }
      }
    ]
  },
  "S13": {
    "now": "15:05",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1121", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": false,
          "unclaimed": ["CS-1107-005"],
          "staleUsers": {},
          "urgent": ["CS-1107-005"]
        }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận CS-1107-005 v1",
        "expect": { "kind": "claim", "code": "claimed" }
      },
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S14": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1122", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Minh", "caseId": "SR-1123", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S15": {
    "now": "15:05",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "CS-1107-006", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Dung", "caseId": "SR-1124", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S16": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1125", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Minh", "caseId": "SR-1126", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S17": {
    "now": "15:00",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1127", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Minh", "caseId": "SR-1128", "version": 1, "expectCode": "claimed" },
      {
        "op": "block",
        "version": 2,
        "expectEvents": [
          { "type": "closed", "caseId": "SR-1127" }
        ]
      }
    ],
    "steps": [
      {
        "sender": "Dung",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      },
      {
        "sender": "Dung",
        "command": "@ledger nhận SR-1127 v2",
        "expect": { "kind": "claim", "code": "closed_case" }
      },
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  },
  "S18": {
    "now": "15:10",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Minh", "caseId": "SR-1129", "version": 1, "expectCode": "claimed" },
      { "op": "claim", "user": "Dung", "caseId": "CS-1107-007", "version": 1, "expectCode": "claimed" }
    ],
    "steps": [
      {
        "sender": "Minh",
        "command": "@ledger status",
        "expect": {
          "kind": "status",
          "done": true,
          "unclaimed": [],
          "staleUsers": {},
          "urgent": []
        }
      }
    ]
  }
}
```