workflow "Build + test on push" {
  on = "push"
  resolves = ["Publish code coverage"]
}

action "Install dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "Build" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install dependencies"]
  args = "build"
}

action "Publish code coverage" {
  uses = "paambaati/codeclimate-action@master"
  needs = ["Install dependencies", "Build"]
  env = {
    CC_TEST_REPORTER_ID = "945dfb58a832d233a3caeb84e3e6d3be212e8c7abcb48117fce63b9adcb43647"
  }
  args = "yarn coverage"
}
