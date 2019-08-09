workflow "Publish code coverage" {
  resolves = ["paambaati/codeclimate-action@master"]
  on = "push"
}

action "paambaati/codeclimate-action" {
  uses = "paambaati/codeclimate-action@master"
  env = {
    CC_TEST_REPORTER_ID = "945dfb58a832d233a3caeb84e3e6d3be212e8c7abcb48117fce63b9adcb43647"
  }
}

action "paambaati/codeclimate-action@master" {
  uses = "paambaati/codeclimate-action@master"
  env = {
    CC_TEST_REPORTER_ID = "945dfb58a832d233a3caeb84e3e6d3be212e8c7abcb48117fce63b9adcb43647"
  }
}
